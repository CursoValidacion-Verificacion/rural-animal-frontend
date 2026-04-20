import { test, expect } from '@playwright/test';
import { LoginPage, CartPage } from '../pages';
import usersData from '../data/users.json';
import cartData from '../data/cart-data.json';

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
    });

    test('Debe agregar un producto al carrito correctamente', async () => {
        await cartPage.gotoShop();
        await cartPage.searchAndAddProduct(cartData.productToAdd.name);

        if (cartData.successMessage) {
            await cartPage.expectSuccessMessage(cartData.successMessage);
        }

        await cartPage.openCart();
        await cartPage.expectCartHasItems();
        await expect(cartPage.cartItems.first()).toContainText(cartData.productToAdd.name);
    });

    test('Debe eliminar un producto del carrito', async () => {
        await cartPage.gotoShop();
        await cartPage.searchAndAddProduct(cartData.productToRemove.name);

        await cartPage.openCart();
        await cartPage.expectCartHasItems();

        await cartPage.removeFirstItem();
        await cartPage.expectEmptyCart();
    });
});