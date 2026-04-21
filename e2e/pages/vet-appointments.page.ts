import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class VetAppointmentsPage extends BasePage {
    // Tabs
    readonly myAppointmentsTab: Locator;
    readonly scheduleAppointmentTab: Locator;

    // Stepper
    readonly stepDate: Locator;
    readonly stepTime: Locator;
    readonly stepVeterinarian: Locator;

    // Step 1 - fechas
    readonly dateCards: Locator;

    // Step 2 - horarios
    readonly backButtons: Locator;
    readonly timeSlots: Locator;

    // Step 3 - veterinarios
    readonly vetCards: Locator;
    readonly confirmButton: Locator;

    // Historial / listado
    readonly appointmentsSection: Locator;
    readonly appointmentsTitle: Locator;
    readonly appointmentsContent: Locator;

    // Mensajes generales
    readonly loader: Locator;

    constructor(page: Page) {
        super(page);

        // Tabs
        this.myAppointmentsTab = page.locator('#appointments-tab');
        this.scheduleAppointmentTab = page.locator('#calendar-tab');

        // Stepper
        this.stepDate = page.locator('.step-label', { hasText: 'Fecha' });
        this.stepTime = page.locator('.step-label', { hasText: 'Hora' });
        this.stepVeterinarian = page.locator('.step-label', { hasText: 'Veterinario' });

        // Paso 1
        this.dateCards = page.locator('.date-card');

        // Paso 2
        this.backButtons = page.locator('button.back-button');
        this.timeSlots = page.locator('.time-slot');

        // Paso 3
        this.vetCards = page.locator('.vet-card');
        this.confirmButton = page.locator('button.submit-button');

        // Historial
        this.appointmentsSection = page.locator('#appointments');
        this.appointmentsTitle = page.getByText('Citas veterinarias');
        this.appointmentsContent = page.locator('#appointments app-veterinary-appointment-list, #appointments');

        // General
        this.loader = page.locator('app-loader');
    }

    async goto(): Promise<void> {
        await this.navigateTo('/app/veterinary-appointments');
    }

    async waitForPageReady(): Promise<void> {
        const loaderVisible = await this.loader.isVisible().catch(() => false);
        if (loaderVisible) {
            await expect(this.loader).toBeHidden({ timeout: 15000 });
        }
    }

    async openMyAppointmentsTab(): Promise<void> {
        await expect(this.myAppointmentsTab).toBeVisible();
        await this.myAppointmentsTab.click();
    }

    async openScheduleAppointmentTab(): Promise<void> {
        await expect(this.scheduleAppointmentTab).toBeVisible();
        await this.scheduleAppointmentTab.click();
    }

    async expectAppointmentsPageVisible(): Promise<void> {
        await this.waitForPageReady();
        await expect(this.myAppointmentsTab).toBeVisible();
        await expect(this.scheduleAppointmentTab).toBeVisible();
    }

    async expectSchedulingWizardVisible(): Promise<void> {
        await expect(this.stepDate).toBeVisible();
        await expect(this.stepTime).toBeVisible();
        await expect(this.stepVeterinarian).toBeVisible();
    }

    async selectFirstAvailableDate(): Promise<void> {
        await expect(this.dateCards.first()).toBeVisible();
        await this.dateCards.first().click();
    }

    async selectDateByIndex(index: number): Promise<void> {
        await expect(this.dateCards.nth(index)).toBeVisible();
        await this.dateCards.nth(index).click();
    }

    async expectTimeStepVisible(): Promise<void> {
        await expect(this.timeSlots.first()).toBeVisible();
    }

    async selectFirstAvailableTimeSlot(): Promise<void> {
        await expect(this.timeSlots.first()).toBeVisible();
        await this.timeSlots.first().click();
    }

    async selectTimeSlotByIndex(index: number): Promise<void> {
        await expect(this.timeSlots.nth(index)).toBeVisible();
        await this.timeSlots.nth(index).click();
    }

    async expectVeterinarianStepVisible(): Promise<void> {
        await expect(this.vetCards.first()).toBeVisible();
        await expect(this.confirmButton).toBeVisible();
    }

    async selectFirstAvailableVeterinarian(): Promise<void> {
        await expect(this.vetCards.first()).toBeVisible();
        await this.vetCards.first().click();
    }

    async selectVeterinarianByIndex(index: number): Promise<void> {
        await expect(this.vetCards.nth(index)).toBeVisible();
        await this.vetCards.nth(index).click();
    }

    async confirmAppointment(): Promise<void> {
        await expect(this.confirmButton).toBeVisible();
        await expect(this.confirmButton).toBeEnabled();
        await this.confirmButton.click();
    }

    async scheduleAppointmentWithFirstAvailableOptions(): Promise<void> {
        await this.openScheduleAppointmentTab();
        await this.expectSchedulingWizardVisible();

        await this.selectFirstAvailableDate();
        await this.expectTimeStepVisible();

        await this.selectFirstAvailableTimeSlot();
        await this.expectVeterinarianStepVisible();

        await this.selectFirstAvailableVeterinarian();
        await this.confirmAppointment();
    }

    async expectAppointmentsHistoryVisible(): Promise<void> {
        await this.openMyAppointmentsTab();
        await expect(this.appointmentsSection).toBeVisible();
        await expect(this.appointmentsContent).toBeVisible();
    }

    async expectHistoryContainsText(text: string): Promise<void> {
        await this.openMyAppointmentsTab();
        await expect(this.appointmentsContent).toContainText(text);
    }

    async expectSuccessMessage(message: string): Promise<void> {
        await expect(this.page.getByText(message, { exact: false })).toBeVisible();
    }

    async expectErrorMessage(message: string): Promise<void> {
        await expect(this.page.getByText(message, { exact: false })).toBeVisible();
    }
}