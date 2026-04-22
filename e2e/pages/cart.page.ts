import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la funcionalidad del carrito de compras.
 * Permite buscar productos, agregarlos al carrito, visualizar el contenido
 * y eliminar elementos.
 */
export class CartPage extends BasePage {
    /** Lista de tarjetas de publicaciones de ventas. */
    readonly salesCards: Locator;
    /** Mensaje vacío de publicaciones. */
    readonly emptySalesMessage: Locator;
    /** Botón para abrir detalle de una venta. */
    readonly detailButtons: Locator;
    /** Título del detalle de una publicación. */
    readonly detailTitle: Locator;
    /** Botón principal en detalle (Comprar / Ir al carrito). */
    readonly buyButton: Locator;
    /** Tarjetas de productos dentro del carrito. */
    readonly cartItems: Locator;
    /** Títulos de productos dentro del carrito. */
    readonly cartItemTitles: Locator;
    /** Botones para eliminar productos del carrito. */
    readonly removeButtons: Locator;
    /** Mensaje que indica que el carrito está vacío. */
    readonly emptyCartMessage: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.salesCards = page.locator('.sales-publications .card');
        this.emptySalesMessage = page.getByText('No hay publicaciones disponibles.');
        this.detailButtons = page.locator('button.details-button');
        this.detailTitle = page.locator('.title');
        this.buyButton = page.locator('button.comprar-button');
        this.cartItems = page.locator('.cart-card');
        this.cartItemTitles = page.locator('.cart-card h3');
        this.removeButtons = page.locator('button.action-button.remove');
        this.emptyCartMessage = page.getByText('Tu carrito está vacío');
    }

    /** Navega a la página de ventas. */
    async gotoSales(): Promise<void> {
        await this.navigateTo('/app/sales');
    }

    /** Navega directamente a la página del carrito. */
    async gotoCart(): Promise<void> {
        await this.navigateTo('/app/shopping-cart');
    }

    /**
     * Espera a que la lista de ventas cargue (con tarjetas o estado vacío).
     */
    async waitForSalesLoaded(): Promise<void> {
        await Promise.race([
            this.salesCards.first().waitFor({ state: 'visible', timeout: 15_000 }),
            this.emptySalesMessage.waitFor({ state: 'visible', timeout: 15_000 }),
        ]);
    }

    /**
     * Indica si existen publicaciones de ventas disponibles.
     */
    async hasSalesAvailable(): Promise<boolean> {
        await this.waitForSalesLoaded();
        const cardsCount = await this.salesCards.count();
        return cardsCount > 0;
    }

    /**
     * Abre el detalle de la primera publicación disponible.
     */
    async openFirstSaleDetails(): Promise<void> {
        await this.waitForSalesLoaded();
        await expect(this.salesCards.first()).toBeVisible();
        await this.detailButtons.first().click();
        await expect(this.detailTitle).toBeVisible();
    }

    /**
     * Obtiene el título de la publicación en detalle.
     */
    async getCurrentDetailTitle(): Promise<string> {
        return (await this.detailTitle.textContent())?.trim() ?? '';
    }

    /**
     * Agrega la publicación actual al carrito.
     */
    async addCurrentPublicationToCart(): Promise<void> {
        await expect(this.buyButton).toBeVisible();
        await expect(this.buyButton).toHaveText(/Comprar|Ir al carrito/);
        await this.buyButton.click();
        await expect(this.buyButton).toHaveText('Ir al carrito');
    }

    /**
     * Navega al carrito desde el botón del detalle.
     */
    async goToCartFromDetails(): Promise<void> {
        await expect(this.buyButton).toHaveText('Ir al carrito');
        await this.buyButton.click();
        await this.waitForUrl(/\/app\/shopping-cart/);
    }

    /**
     * Limpia el carrito almacenado en localStorage.
     */
    async clearCartStorage(): Promise<void> {
        await this.page.evaluate(() => localStorage.removeItem('shopping_cart'));
    }

    /**
     * Elimina el primer producto del carrito.
     */
    async removeFirstItem(): Promise<void> {
        await this.removeButtons.first().click();
    }

    /**
     * Verifica que exista al menos un producto en el carrito.
     */
    async expectCartHasItems(): Promise<void> {
        await expect(this.cartItems.first()).toBeVisible();
    }

    /**
     * Verifica que el carrito esté vacío.
     */
    async expectEmptyCart(): Promise<void> {
        await expect(this.emptyCartMessage).toBeVisible();
    }

    /**
     * Verifica que exista un título específico dentro del carrito.
     *
     * @param title - Título esperado.
     */
    async expectCartContainsTitle(title: string): Promise<void> {
        await expect(this.cartItemTitles.filter({ hasText: title }).first()).toBeVisible();
    }
}
