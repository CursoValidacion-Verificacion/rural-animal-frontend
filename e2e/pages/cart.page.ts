import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
    // Sales list
    readonly salesCards: Locator;
    readonly detailsButtons: Locator;
    readonly emptySalesMessage: Locator;

    // Publication detail
    readonly publicationTitle: Locator;
    readonly publicationPrice: Locator;
    readonly buyButton: Locator;
    readonly modelButton: Locator;

    // Cart
    readonly cartTitle: Locator;
    readonly cartCount: Locator;
    readonly cartItems: Locator;
    readonly removeButtons: Locator;
    readonly clearCartButton: Locator;
    readonly checkoutButton: Locator;
    readonly emptyCartMessage: Locator;
    readonly continueShoppingButton: Locator;
    readonly totalText: Locator;

    constructor(page: Page) {
        super(page);

        // Lista de ventas
        this.salesCards = page.locator('.sales-publications .card');
        this.detailsButtons = page.locator('button.details-button');
        this.emptySalesMessage = page.getByText('No hay publicaciones disponibles.');

        // Detalle de publicación
        this.publicationTitle = page.locator('.title');
        this.publicationPrice = page.locator('.price');
        this.buyButton = page.locator('button.comprar-button');
        this.modelButton = page.locator('button.model');

        // Carrito
        this.cartTitle = page.locator('h2').filter({ hasText: 'Carrito de compras' });
        this.cartCount = page.locator('.cart-count');
        this.cartItems = page.locator('.cart-card');
        this.removeButtons = page.locator('button.action-button.remove');
        this.clearCartButton = page.locator('button.clear-button');
        this.checkoutButton = page.locator('button.checkout-button');
        this.emptyCartMessage = page.getByText('Tu carrito está vacío');
        this.continueShoppingButton = page.locator('button.back-button');
        this.totalText = page.locator('.total');
    }

    async gotoSales(): Promise<void> {
        await this.navigateTo('/app/sales');
    }

    async gotoCart(): Promise<void> {
        await this.navigateTo('/app/shopping-cart');
    }

    async expectSalesListVisible(): Promise<void> {
        await expect(this.salesCards.first()).toBeVisible();
    }

    async openFirstPublicationDetails(): Promise<void> {
        await expect(this.detailsButtons.first()).toBeVisible();
        await this.detailsButtons.first().click();
    }

    async openPublicationDetailsByTitle(title: string): Promise<void> {
        const card = this.page.locator('.sales-publications .card').filter({
            has: this.page.locator('.card-title', { hasText: title })
        });

        await expect(card).toBeVisible();
        await card.locator('button.details-button').click();
    }

    async expectPublicationDetailVisible(): Promise<void> {
        await expect(this.publicationTitle).toBeVisible();
        await expect(this.buyButton).toBeVisible();
    }

    async addCurrentPublicationToCart(): Promise<void> {
        await expect(this.buyButton).toBeVisible();
        await this.buyButton.click();
    }

    async goToCartFromDetailIfAvailable(): Promise<void> {
        const cartRedirectButton = this.page.locator('button.comprar-button', {
            hasText: /Ir al carrito/i
        });

        if (await cartRedirectButton.isVisible()) {
            await cartRedirectButton.click();
        } else {
            await this.gotoCart();
        }
    }

    async addFirstAvailableProductToCart(): Promise<void> {
        await this.openFirstPublicationDetails();
        await this.expectPublicationDetailVisible();
        await this.addCurrentPublicationToCart();
    }

    async addProductToCartByTitle(title: string): Promise<void> {
        await this.openPublicationDetailsByTitle(title);
        await this.expectPublicationDetailVisible();
        await this.addCurrentPublicationToCart();
    }

    async expectCartPageVisible(): Promise<void> {
        await expect(this.cartTitle).toBeVisible();
    }

    async expectCartHasItems(): Promise<void> {
        await expect(this.cartItems.first()).toBeVisible();
    }

    async expectEmptyCart(): Promise<void> {
        await expect(this.emptyCartMessage).toBeVisible();
    }

    async removeFirstItem(): Promise<void> {
        await expect(this.removeButtons.first()).toBeVisible();
        await this.removeButtons.first().click();
    }

    async clearCart(): Promise<void> {
        await expect(this.clearCartButton).toBeVisible();
        await this.clearCartButton.click();
    }

    async expectCartContainsProduct(title: string): Promise<void> {
        await expect(this.cartItems.filter({ hasText: title }).first()).toBeVisible();
    }

    async expectCartCountToContain(text: string): Promise<void> {
        await expect(this.cartCount).toContainText(text);
    }
}