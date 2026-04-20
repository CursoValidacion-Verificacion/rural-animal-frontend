import { test } from '@playwright/test';
import { LoginPage, AuctionsPage } from '../pages';
import usersData from '../data/users.json';
import auctionsData from '../data/auctions-data.json';

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
        await auctionsPage.goto();
    });

    test('Debe permitir abrir una subasta y visualizar su detalle', async () => {
        await auctionsPage.openAuction(auctionsData.validBid.auctionTitle);
        await auctionsPage.expectAuctionDetailVisible();
    });

    test('Debe permitir realizar una puja válida', async () => {
        await auctionsPage.openAuction(auctionsData.validBid.auctionTitle);
        await auctionsPage.placeBid(String(auctionsData.validBid.bidAmount));

        await auctionsPage.expectSuccessMessage(auctionsData.validBid.successMessage);
    });

    test('Debe mostrar error al realizar una puja inválida', async () => {
        await auctionsPage.openAuction(auctionsData.invalidBid.auctionTitle);
        await auctionsPage.placeBid(String(auctionsData.invalidBid.bidAmount));

        await auctionsPage.expectErrorMessage(auctionsData.invalidBid.errorMessage);
    });
});