import { test } from '@playwright/test';
import { LoginPage, CartPage } from '../pages';
import usersData from '../data/users.json';

/**
 * Suite de pruebas E2E para carrito de compras.
 * Valida agregar productos, visualizar carrito y eliminar ítems.
 */
test.describe('Carrito de Compras @cart @e2e', () => {
    let loginPage: LoginPage;
    let cartPage: CartPage;

    const buyerUser = usersData.validUsers.find(user => user.role === 'BUYER');

    test.beforeEach(async ({ page }) => {
        if (!buyerUser) {
            throw new Error('No se encontró un usuario BUYER en users.json');
        }

        loginPage = new LoginPage(page);
        cartPage = new CartPage(page);

        await loginPage.goto();
        await loginPage.login(buyerUser.email, buyerUser.password);

        await page.waitForURL(/\/app\//, { timeout: 15_000 });
        await page.waitForFunction(
            () => !!localStorage.getItem('access_token') && !!localStorage.getItem('auth_user'),
            { timeout: 15_000 }
        );
        await cartPage.clearCartStorage();
    });

    test('Debe agregar un producto al carrito correctamente', async () => {
        await cartPage.gotoSales();
        const hasSales = await cartPage.hasSalesAvailable();
        test.skip(!hasSales, 'No hay publicaciones de ventas disponibles para el test de carrito.');

        await cartPage.openFirstSaleDetails();

        const publicationTitle = await cartPage.getCurrentDetailTitle();
        test.skip(!publicationTitle, 'No se encontró una publicación válida para agregar al carrito.');

        await cartPage.addCurrentPublicationToCart();
        await cartPage.goToCartFromDetails();
        await cartPage.expectCartHasItems();
        await cartPage.expectCartContainsTitle(publicationTitle);
    });

    test('Debe eliminar un producto del carrito', async () => {
        await cartPage.gotoSales();
        const hasSales = await cartPage.hasSalesAvailable();
        test.skip(!hasSales, 'No hay publicaciones de ventas disponibles para el test de carrito.');

        await cartPage.openFirstSaleDetails();
        await cartPage.addCurrentPublicationToCart();
        await cartPage.goToCartFromDetails();

        await cartPage.expectCartHasItems();

        await cartPage.removeFirstItem();
        await cartPage.expectEmptyCart();
    });
});
