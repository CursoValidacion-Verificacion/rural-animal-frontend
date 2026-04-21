import { test } from '@playwright/test';
import { LoginPage, AuctionsPage } from '../pages';
import usersData from '../data/users.json';
import auctionsData from '../data/auctions-data.json';

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

        await page.waitForURL(/\/app\//, { timeout: 15000 });
        await auctionsPage.goto();
    });

    test('Debe permitir abrir una subasta y visualizar su detalle', async () => {
        if (auctionsData.validBid?.auctionTitle) {
            await auctionsPage.openAuctionByTitle(auctionsData.validBid.auctionTitle);
        } else {
            await auctionsPage.openFirstAuctionDetails();
        }

        await auctionsPage.expectAuctionDetailVisible();
        await auctionsPage.expectTimerVisible();
        await auctionsPage.expectBidSectionVisible();
    });

    test('Debe permitir participar en una subasta si la puja está habilitada', async () => {
        if (auctionsData.validBid?.auctionTitle) {
            await auctionsPage.openAuctionByTitle(auctionsData.validBid.auctionTitle);
        } else {
            await auctionsPage.openFirstAuctionDetails();
        }

        await auctionsPage.expectAuctionDetailVisible();
        await auctionsPage.expectBidButtonEnabled();

        if (auctionsData.validBid?.buttonText) {
            await auctionsPage.expectBidButtonText(new RegExp(auctionsData.validBid.buttonText, 'i'));
        }

        await auctionsPage.clickBid();

        if (auctionsData.validBid?.successMessage) {
            await auctionsPage.expectSuccessMessage(auctionsData.validBid.successMessage);
        }
    });

    test('Debe validar una subasta sin pujas o con última puja visible', async () => {
        if (auctionsData.validBid?.auctionTitle) {
            await auctionsPage.openAuctionByTitle(auctionsData.validBid.auctionTitle);
        } else {
            await auctionsPage.openFirstAuctionDetails();
        }

        await auctionsPage.expectAuctionDetailVisible();
        await auctionsPage.expectBidSectionVisible();
    });

    test('Debe mostrar el botón de puja deshabilitado cuando no se puede participar', async () => {
        if (auctionsData.invalidBid?.auctionTitle) {
            await auctionsPage.openAuctionByTitle(auctionsData.invalidBid.auctionTitle);
        } else {
            await auctionsPage.openFirstAuctionDetails();
        }

        await auctionsPage.expectAuctionDetailVisible();

        if (auctionsData.invalidBid?.buttonText) {
            await auctionsPage.expectBidButtonText(new RegExp(auctionsData.invalidBid.buttonText, 'i'));
        }

        await auctionsPage.expectBidButtonDisabled();
    });
});