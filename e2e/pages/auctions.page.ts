import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la sección de subastas.
 * Permite visualizar subastas, abrir el detalle y realizar pujas.
 */
export class AuctionsPage extends BasePage {
    /** Tarjetas de subastas disponibles. */
    readonly auctionCards: Locator;
    /** Estado vacío de lista de subastas. */
    readonly emptyListMessage: Locator;
    /** Título en el detalle de subasta. */
    readonly detailTitle: Locator;
    /** Botón para realizar puja. */
    readonly bidButton: Locator;
    /** Texto del incremento mínimo en detalle. */
    readonly minimumIncreaseText: Locator;
    /** Monto de última puja en detalle. */
    readonly lastBidAmountText: Locator;
    /** Texto de estado cuando no hay pujas. */
    readonly noBidsText: Locator;
    /** Modal de confirmación de SweetAlert2. */
    readonly bidConfirmationModal: Locator;
    /** Botón de confirmar en modal de puja. */
    readonly confirmBidButton: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.auctionCards = page.locator('.sales-publications .card');
        this.emptyListMessage = page.getByText('No hay publicaciones disponibles.');
        this.detailTitle = page.locator('.title');
        this.bidButton = page.locator('button.bid-button');
        this.minimumIncreaseText = page.locator('.minimum-increase');
        this.lastBidAmountText = page.locator('.last-bid-container .amount');
        this.noBidsText = page.locator('.no-bids');
        this.bidConfirmationModal = page.locator('.swal2-popup');
        this.confirmBidButton = page.getByRole('button', { name: 'Sí, confirmar' });
    }

    /** Navega a la página de subastas. */
    async goto(): Promise<void> {
        await this.navigateTo('/app/auctions');
    }

    /**
     * Espera a que la lista de subastas termine de cargar.
     */
    async waitForAuctionsLoaded(): Promise<void> {
        await Promise.race([
            this.auctionCards.first().waitFor({ state: 'visible', timeout: 15_000 }),
            this.emptyListMessage.waitFor({ state: 'visible', timeout: 15_000 }),
        ]);
    }

    /**
     * Abre una subasta específica por título.
     *
     * @param auctionTitle - Título o nombre de la subasta.
     */
    async openAuction(auctionTitle: string): Promise<void> {
        await this.waitForAuctionsLoaded();
        const selectedCard = this.auctionCards.filter({ hasText: auctionTitle }).first();
        await expect(selectedCard).toBeVisible();
        await selectedCard.getByRole('button', { name: 'Detalles' }).click();
        await expect(this.detailTitle).toBeVisible();
    }

    /**
     * Abre el modal de confirmación de puja y confirma la acción.
     */
    async placeBidAndConfirm(): Promise<void> {
        await expect(this.bidButton).toBeVisible();
        await expect(this.bidButton).toBeEnabled();
        await this.bidButton.click();
        await expect(this.bidConfirmationModal).toBeVisible();
        await this.confirmBidButton.click();
        await expect(this.bidConfirmationModal).toBeHidden();
    }

    /**
     * Obtiene el incremento mínimo configurado para la subasta actual.
     */
    async getMinimumIncreaseAmount(): Promise<number> {
        const text = (await this.minimumIncreaseText.textContent()) ?? '';
        return this.parseCurrencyToNumber(text);
    }

    /**
     * Obtiene la última puja visible; si no existe, retorna el precio base de fallback.
     *
     * @param fallbackAmount - Monto base para usar si no hay pujas aún.
     */
    async getCurrentBidAmountOrFallback(fallbackAmount: number): Promise<number> {
        if (await this.lastBidAmountText.isVisible().catch(() => false)) {
            const text = (await this.lastBidAmountText.textContent()) ?? '';
            return this.parseCurrencyToNumber(text);
        }
        return fallbackAmount;
    }

    /**
     * Espera hasta que el monto visible de última puja alcance al menos el valor esperado.
     *
     * @param expectedMinimum - Monto mínimo esperado después de pujar.
     */
    async expectBidAtLeast(expectedMinimum: number): Promise<void> {
        await expect.poll(async () => {
            const text = (await this.lastBidAmountText.textContent()) ?? '';
            return this.parseCurrencyToNumber(text);
        }, { timeout: 15_000 }).toBeGreaterThanOrEqual(expectedMinimum);
    }

    /**
     * Verifica que el detalle principal de la subasta esté visible.
     */
    async expectAuctionDetailVisible(): Promise<void> {
        await expect(this.detailTitle).toBeVisible();
        await expect(this.bidButton).toBeVisible();
        await expect(this.minimumIncreaseText).toBeVisible();
        await expect(this.lastBidAmountText.or(this.noBidsText)).toBeVisible();
    }

    /**
     * Convierte texto monetario a número entero (CRC) para comparaciones en tests.
     */
    private parseCurrencyToNumber(value: string): number {
        const numeric = value.replace(/[^\d]/g, '');
        return numeric ? Number(numeric) : 0;
    }
}
