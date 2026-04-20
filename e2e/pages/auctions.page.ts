import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la sección de subastas.
 * Permite visualizar subastas, abrir el detalle y realizar pujas.
 */
export class AuctionsPage extends BasePage {
    /** Campo de búsqueda de subastas. */
    readonly searchInput: Locator;
    /** Tarjetas o filas de subastas disponibles. */
    readonly auctionCards: Locator;
    /** Campo de monto de puja. */
    readonly bidAmountInput: Locator;
    /** Botón para enviar la puja. */
    readonly bidButton: Locator;
    /** Mensaje de éxito al realizar una puja válida. */
    readonly successMessage: Locator;
    /** Mensaje de error al intentar una puja inválida. */
    readonly errorMessage: Locator;
    /** Texto con la puja actual o mínima. */
    readonly currentBidText: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
        this.auctionCards = page.locator('.auction-card, .card, tbody tr');
        this.bidAmountInput = page.locator('input[name="bidAmount"], input[type="number"]');
        this.bidButton = page.locator('button:has-text("Pujar"), button:has-text("Bid")');
        this.successMessage = page.locator('.alert-success, .toast-success, .success-message');
        this.errorMessage = page.locator('.alert-danger, .text-danger, .error-message');
        this.currentBidText = page.locator('.current-bid, .highest-bid, .minimum-bid');
    }

    /** Navega a la página de subastas. */
    async goto(): Promise<void> {
        await this.navigateTo('/auctions');
    }

    /**
     * Busca una subasta y abre la primera coincidencia.
     *
     * @param auctionTitle - Título o nombre de la subasta.
     */
    async openAuction(auctionTitle: string): Promise<void> {
        await this.searchInput.fill(auctionTitle);
        await this.auctionCards.first().click();
    }

    /**
     * Ingresa un monto y realiza la puja.
     *
     * @param amount - Monto de la puja.
     */
    async placeBid(amount: string): Promise<void> {
        await this.bidAmountInput.fill(amount);
        await this.bidButton.click();
    }

    /**
     * Verifica que una puja válida haya sido procesada correctamente.
     *
     * @param message - Texto esperado del mensaje de éxito.
     */
    async expectSuccessMessage(message: string): Promise<void> {
        await expect(this.successMessage).toBeVisible();
        await expect(this.successMessage).toContainText(message);
    }

    /**
     * Verifica que una puja inválida muestre un mensaje de error.
     *
     * @param message - Texto esperado del mensaje de error.
     */
    async expectErrorMessage(message: string): Promise<void> {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toContainText(message);
    }

    /**
     * Verifica que el detalle principal de la subasta esté visible.
     */
    async expectAuctionDetailVisible(): Promise<void> {
        await expect(this.bidAmountInput).toBeVisible();
        await expect(this.bidButton).toBeVisible();
        await expect(this.currentBidText).toBeVisible();
    }
}