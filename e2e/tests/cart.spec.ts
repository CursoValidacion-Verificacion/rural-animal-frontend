import { test, expect } from '@playwright/test';
import { LoginPage, CartPage } from '../pages';
import usersData from '../data/users.json';
import cartData from '../data/cart-data.json';

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

        await page.waitForURL(/\/app\//, { timeout: 15000 });
    });

    test('Debe mostrar correctamente el carrito vacío', async () => {
        await cartPage.gotoCart();
        await cartPage.expectCartPageVisible();
        await cartPage.expectEmptyCart();
    });

    test('Debe agregar un producto al carrito correctamente', async () => {
        await cartPage.gotoSales();
        await cartPage.expectSalesListVisible();

        if (cartData.productToAdd?.name) {
            await cartPage.addProductToCartByTitle(cartData.productToAdd.name);
        } else {
            await cartPage.addFirstAvailableProductToCart();
        }

        await cartPage.goToCartFromDetailIfAvailable();
        await cartPage.expectCartPageVisible();
        await cartPage.expectCartHasItems();

        if (cartData.productToAdd?.name) {
            await cartPage.expectCartContainsProduct(cartData.productToAdd.name);
        }
    });

    test('Debe eliminar un producto del carrito', async () => {
        await cartPage.gotoSales();
        await cartPage.expectSalesListVisible();

        if (cartData.productToRemove?.name) {
            await cartPage.addProductToCartByTitle(cartData.productToRemove.name);
        } else {
            await cartPage.addFirstAvailableProductToCart();
        }

        await cartPage.goToCartFromDetailIfAvailable();
        await cartPage.expectCartPageVisible();
        await cartPage.expectCartHasItems();

        await cartPage.removeFirstItem();
        await cartPage.expectEmptyCart();
    });

    test('Debe vaciar el carrito correctamente', async () => {
        await cartPage.gotoSales();
        await cartPage.expectSalesListVisible();

        await cartPage.addFirstAvailableProductToCart();
        await cartPage.goToCartFromDetailIfAvailable();

        await cartPage.expectCartPageVisible();
        await cartPage.expectCartHasItems();

        await cartPage.clearCart();
        await cartPage.expectEmptyCart();
    });
});