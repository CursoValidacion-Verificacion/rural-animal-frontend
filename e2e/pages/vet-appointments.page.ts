import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la gestión de citas veterinarias.
 * Permite registrar una nueva cita y validar el historial de citas agendadas.
 */
export class VetAppointmentsPage extends BasePage {
    /** Tab de lista de citas. */
    readonly appointmentsTabButton: Locator;
    /** Tab de agendamiento. */
    readonly scheduleTabButton: Locator;
    /** Tabla/lista de historial de citas. */
    readonly historyTable: Locator;
    /** Tarjetas de fecha disponibles. */
    readonly availableDateCards: Locator;
    /** Slots de hora disponibles. */
    readonly availableTimeSlots: Locator;
    /** Tarjetas de veterinario disponibles. */
    readonly availableVeterinarianCards: Locator;
    /** Botón para confirmar cita. */
    readonly confirmAppointmentButton: Locator;
    /** Mensaje de alerta de éxito por cita creada. */
    readonly successToast: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.appointmentsTabButton = page.locator('#appointments-tab');
        this.scheduleTabButton = page.locator('#calendar-tab');
        this.historyTable = page.locator('app-veterinary-appointment-list table');
        this.availableDateCards = page.locator('.date-card');
        this.availableTimeSlots = page.locator('.time-slot');
        this.availableVeterinarianCards = page.locator('.vet-card');
        this.confirmAppointmentButton = page.locator('button.submit-button');
        this.successToast = page.locator('.mat-mdc-snack-bar-container, simple-snack-bar');
    }

    /** Navega a la página de citas veterinarias. */
    async goto(): Promise<void> {
        await this.navigateTo('/app/appointment');
    }

    /**
     * Verifica si existen fechas disponibles para agendar cita.
     */
    async hasAvailableDates(): Promise<boolean> {
        await this.scheduleTabButton.click();
        await this.availableDateCards.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
        return (await this.availableDateCards.count()) > 0;
    }

    /**
     * Agendar una cita seleccionando primera fecha, hora y veterinario disponible.
     */
    async createAppointmentWithFirstAvailableOptions(): Promise<void> {
        await this.scheduleTabButton.click();
        await expect(this.availableDateCards.first()).toBeVisible({ timeout: 15_000 });
        await this.availableDateCards.first().click();

        await expect(this.availableTimeSlots.first()).toBeVisible({ timeout: 15_000 });
        await this.availableTimeSlots.first().click();

        await expect(this.availableVeterinarianCards.first()).toBeVisible({ timeout: 15_000 });
        await expect(this.confirmAppointmentButton).toBeDisabled();

        await this.availableVeterinarianCards.first().click();
        await expect(this.confirmAppointmentButton).toBeEnabled();

        const createAppointmentResponse = this.page.waitForResponse(
            (response) =>
                response.url().includes('/veterinary_appointments') &&
                response.request().method() === 'POST' &&
                response.status() < 400,
            { timeout: 20_000 }
        );

        await this.confirmAppointmentButton.click();
        await createAppointmentResponse;
    }

    /**
     * Verifica que en paso 3 el botón confirmar esté deshabilitado hasta elegir veterinario.
     */
    async expectSubmitDisabledWithoutVeterinarianSelection(): Promise<void> {
        await this.scheduleTabButton.click();
        await this.page.waitForResponse(
            (response) =>
                response.url().includes('/veterinary_appointments/availability') &&
                response.request().method() === 'GET',
            { timeout: 20_000 }
        ).catch(() => null);

        await expect.poll(
            async () => await this.availableDateCards.count(),
            { timeout: 20_000 }
        ).toBeGreaterThan(0);

        await expect(this.availableDateCards.first()).toBeVisible({ timeout: 10_000 });
        await this.availableDateCards.first().click();
        await expect(this.availableTimeSlots.first()).toBeVisible({ timeout: 15_000 });
        await this.availableTimeSlots.first().click();
        await expect(this.confirmAppointmentButton).toBeVisible();
        await expect(this.confirmAppointmentButton).toBeDisabled();
    }

    /**
     * Verifica que se muestre feedback de éxito al crear cita.
     */
    async expectSuccessMessage(): Promise<void> {
        await expect(this.successToast).toContainText(/cita creada satisfactoriamente/i, { timeout: 10_000 });
    }

    /**
     * Verifica que los elementos principales de la página estén visibles.
     */
    async expectAppointmentsPageVisible(): Promise<void> {
        await expect(this.appointmentsTabButton).toBeVisible();
        await expect(this.scheduleTabButton).toBeVisible();
        await expect(this.historyTable).toBeVisible();
    }
}
