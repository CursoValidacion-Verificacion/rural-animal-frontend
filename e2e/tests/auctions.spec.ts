import { type Page, test } from '@playwright/test';
import { LoginPage, AuctionsPage } from '../pages';
import usersData from '../data/users.json';
import { ENV } from '../config/env.config';

interface AuctionApiItem {
    id: number;
    title: string;
    price: number;
    state?: string;
    startDate?: string;
    endDate?: string;
    minimumIncrease?: number;
    user?: {
        id?: number;
    };
}

interface AuctionsApiResponse {
    data: AuctionApiItem[];
}

function isAuctionOpen(auction: AuctionApiItem): boolean {
    if (!auction.startDate || !auction.endDate) {
        return false;
    }
    const now = Date.now();
    const startsAt = new Date(auction.startDate).getTime();
    const endsAt = new Date(auction.endDate).getTime();

    return auction.state === 'Activa' && startsAt <= now && endsAt > now;
}

function parseStoredJsonValue<T>(value: string | null): T | null {
    if (!value) return null;

    try {
        return JSON.parse(value) as T;
    } catch {
        return value as unknown as T;
    }
}

async function getAuthSession(page: Page) {
    const session = await page.evaluate(() => ({
        tokenRaw: localStorage.getItem('access_token'),
        userRaw: localStorage.getItem('auth_user'),
    }));

    const token = parseStoredJsonValue<string>(session.tokenRaw);
    const authUser = parseStoredJsonValue<{ id?: number }>(session.userRaw);

    if (!token || !authUser?.id) {
        throw new Error('No se pudo obtener sesión autenticada desde localStorage.');
    }

    return {
        token,
        userId: authUser.id,
    };
}

async function fetchAuctions(page: Page, token: string): Promise<AuctionApiItem[]> {
    const response = await page.request.get(`${ENV.API_URL}/publications/auctions`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok()) {
        throw new Error(`No se pudo consultar /publications/auctions. Status: ${response.status()}`);
    }

    const payload = await response.json() as AuctionsApiResponse;
    return payload.data ?? [];
}

/**
 * Suite de pruebas E2E para subastas.
 * Valida visualización del detalle, puja válida y puja inválida.
 */
test.describe('Subastas @auctions @e2e', () => {
    let loginPage: LoginPage;
    let auctionsPage: AuctionsPage;

    const buyerUser = usersData.validUsers.find(user => user.role === 'BUYER');

    test.beforeEach(async ({ page }) => {
        if (!buyerUser) {
            throw new Error('No se encontró un usuario BUYER en users.json');
        }

        loginPage = new LoginPage(page);
        auctionsPage = new AuctionsPage(page);

        await loginPage.goto();
        await loginPage.login(buyerUser.email, buyerUser.password);

        await page.waitForURL(/\/app\//, { timeout: 15_000 });
        await page.waitForFunction(
            () => !!localStorage.getItem('access_token') && !!localStorage.getItem('auth_user'),
            { timeout: 15_000 }
        );
        await auctionsPage.goto();
    });

    test('Debe permitir abrir una subasta y visualizar su detalle', async ({ page }) => {
        const { token } = await getAuthSession(page);
        const auctions = await fetchAuctions(page, token);
        const auctionToOpen = auctions.find(isAuctionOpen);

        test.skip(!auctionToOpen, 'No hay subastas activas disponibles para validar detalle.');

        await auctionsPage.openAuction(auctionToOpen!.title);
        await auctionsPage.expectAuctionDetailVisible();
    });

    test('Debe permitir realizar una puja válida', async ({ page }) => {
        const { token, userId } = await getAuthSession(page);
        const auctions = await fetchAuctions(page, token);
        const targetAuction = auctions.find(auction =>
            isAuctionOpen(auction) && auction.user?.id !== userId
        );

        test.skip(!targetAuction, 'No hay subastas activas de terceros para validar puja.');

        await auctionsPage.openAuction(targetAuction!.title);

        const currentBid = await auctionsPage.getCurrentBidAmountOrFallback(targetAuction!.price);
        const minimumIncrease = await auctionsPage.getMinimumIncreaseAmount();

        await auctionsPage.placeBidAndConfirm();
        await auctionsPage.expectBidAtLeast(currentBid + minimumIncrease);
    });

    test('Debe mostrar error cuando intenta pujar en su propia subasta', async ({ page }) => {
        const { token, userId } = await getAuthSession(page);
        const auctions = await fetchAuctions(page, token);
        const ownAuction = auctions.find(auction =>
            isAuctionOpen(auction) && auction.user?.id === userId
        );

        test.skip(!ownAuction, 'No hay subastas propias activas para validar error de puja.');

        await auctionsPage.openAuction(ownAuction!.title);
        await auctionsPage.placeBidAndConfirm();
        await auctionsPage.expectBidError('No puedes pujar en tu propia subasta');
    });
});
