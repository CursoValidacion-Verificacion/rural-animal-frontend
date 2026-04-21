import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuctionsPage extends BasePage {
    // Lista de subastas
    readonly auctionCards: Locator;
    readonly detailsButtons: Locator;
    readonly emptyAuctionsMessage: Locator;

    // Detalle de subasta
    readonly auctionTitle: Locator;
    readonly auctionPrice: Locator;
    readonly minimumIncreaseText: Locator;
    readonly timerText: Locator;
    readonly bidButton: Locator;
    readonly modelButton: Locator;

    // Última puja
    readonly lastBidContainer: Locator;
    readonly lastBidAmount: Locator;
    readonly bidderName: Locator;
    readonly noBidsText: Locator;

    constructor(page: Page) {
        super(page);

        // Lista
        this.auctionCards = page.locator('.sales-publications .card');
        this.detailsButtons = page.locator('button.details-button');
        this.emptyAuctionsMessage = page.getByText('No hay publicaciones disponibles.');

        // Detalle
        this.auctionTitle = page.locator('.title');
        this.auctionPrice = page.locator('.price');
        this.minimumIncreaseText = page.locator('.minimum-increase');
        this.timerText = page.locator('.timer');
        this.bidButton = page.locator('button.bid-button');
        this.modelButton = page.locator('button.model');

        // Última puja
        this.lastBidContainer = page.locator('.last-bid-container');
        this.lastBidAmount = page.locator('.last-bid-container .amount');
        this.bidderName = page.locator('.bidder-name');
        this.noBidsText = page.getByText('No tiene pujas');
    }

    async goto(): Promise<void> {
        await this.navigateTo('/app/appointment');
    }

    async expectAuctionsListVisible(): Promise<void> {
        await expect(this.auctionCards.first()).toBeVisible();
    }

    async openFirstAuctionDetails(): Promise<void> {
        await expect(this.detailsButtons.first()).toBeVisible();
        await this.detailsButtons.first().click();
    }

    async openAuctionByTitle(title: string): Promise<void> {
        const card = this.page.locator('.sales-publications .card').filter({
            has: this.page.locator('.card-title', { hasText: title })
        });

        await expect(card).toBeVisible();
        await card.locator('button.details-button').click();
    }

    async expectAuctionDetailVisible(): Promise<void> {
        await expect(this.auctionTitle).toBeVisible();
        await expect(this.auctionPrice).toBeVisible();
        await expect(this.minimumIncreaseText).toBeVisible();
        await expect(this.bidButton).toBeVisible();
    }

    async expectTimerVisible(): Promise<void> {
        await expect(this.timerText).toBeVisible();
    }

    async expectBidSectionVisible(): Promise<void> {
        const hasLastBid = await this.lastBidContainer.isVisible().catch(() => false);
        const hasNoBids = await this.noBidsText.isVisible().catch(() => false);

        expect(hasLastBid || hasNoBids).toBeTruthy();
    }

    async clickBid(): Promise<void> {
        await expect(this.bidButton).toBeVisible();
        await this.bidButton.click();
    }

    async expectBidButtonEnabled(): Promise<void> {
        await expect(this.bidButton).toBeEnabled();
    }

    async expectBidButtonDisabled(): Promise<void> {
        await expect(this.bidButton).toBeDisabled();
    }

    async expectBidButtonText(text: string | RegExp): Promise<void> {
        await expect(this.bidButton).toHaveText(text);
    }

    async expectLastBidVisible(): Promise<void> {
        await expect(this.lastBidContainer).toBeVisible();
        await expect(this.lastBidAmount).toBeVisible();
    }

    async expectNoBidsMessage(): Promise<void> {
        await expect(this.noBidsText).toBeVisible();
    }

    async expectSuccessMessage(text: string): Promise<void> {
        await expect(this.page.getByText(text, { exact: false })).toBeVisible();
    }

    async expectErrorMessage(text: string): Promise<void> {
        await expect(this.page.getByText(text, { exact: false })).toBeVisible();
    }
}