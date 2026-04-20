import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la gestión de citas veterinarias.
 * Permite registrar una nueva cita y validar el historial de citas agendadas.
 */
export class VetAppointmentsPage extends BasePage {
    /** Campo de nombre de mascota. */
    readonly petNameInput: Locator;
    /** Campo de fecha de la cita. */
    readonly dateInput: Locator;
    /** Campo de hora de la cita. */
    readonly timeInput: Locator;
    /** Campo de motivo o descripción de la cita. */
    readonly reasonInput: Locator;
    /** Botón para guardar/agendar la cita. */
    readonly saveButton: Locator;
    /** Tabla o lista de historial de citas. */
    readonly historyTable: Locator;
    /** Mensaje de éxito al registrar la cita. */
    readonly successMessage: Locator;
    /** Mensaje de error o validación. */
    readonly errorMessage: Locator;
    /** Título de la sección de citas veterinarias. */
    readonly pageTitle: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.petNameInput = page.locator('#petName, input[formcontrolname="petName"]');
        this.dateInput = page.locator('#date, input[type="date"]');
        this.timeInput = page.locator('#time, input[type="time"]');
        this.reasonInput = page.locator('#reason, textarea[formcontrolname="reason"]');
        this.saveButton = page.locator('button:has-text("Agendar"), button:has-text("Guardar"), button[type="submit"]');
        this.historyTable = page.locator('table, .appointment-history, .history-list');
        this.successMessage = page.locator('.alert-success, .toast-success, .success-message');
        this.errorMessage = page.locator('.alert-danger, .text-danger, .error-message');
        this.pageTitle = page.locator('h1, h2').filter({ hasText: /citas veterinarias|veterinarias|appointments/i });
    }

    /** Navega a la página de citas veterinarias. */
    async goto(): Promise<void> {
        await this.navigateTo('/vet-appointments');
    }

    /**
     * Completa y guarda una nueva cita veterinaria.
     *
     * @param petName - Nombre de la mascota.
     * @param date - Fecha de la cita.
     * @param time - Hora de la cita.
     * @param reason - Motivo de la cita.
     */
    async createAppointment(
        petName: string,
        date: string,
        time: string,
        reason: string
    ): Promise<void> {
        await this.petNameInput.fill(petName);
        await this.dateInput.fill(date);
        await this.timeInput.fill(time);
        await this.reasonInput.fill(reason);
        await this.saveButton.click();
    }

    /**
     * Verifica que el historial contenga una cita con el nombre de la mascota indicado.
     *
     * @param petName - Nombre de la mascota esperado en el historial.
     */
    async expectAppointmentInHistory(petName: string): Promise<void> {
        await expect(this.historyTable).toBeVisible();
        await expect(this.historyTable).toContainText(petName);
    }

    /**
     * Verifica que se muestre un mensaje de éxito al agendar una cita.
     *
     * @param message - Texto esperado del mensaje.
     */
    async expectSuccessMessage(message: string): Promise<void> {
        await expect(this.successMessage).toBeVisible();
        await expect(this.successMessage).toContainText(message);
    }

    /**
     * Verifica que se muestre un mensaje de error o validación.
     *
     * @param message - Texto esperado del mensaje.
     */
    async expectErrorMessage(message: string): Promise<void> {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toContainText(message);
    }

    /**
     * Verifica que los elementos principales de la página estén visibles.
     */
    async expectAppointmentsPageVisible(): Promise<void> {
        await expect(this.pageTitle).toBeVisible();
        await expect(this.petNameInput).toBeVisible();
        await expect(this.dateInput).toBeVisible();
        await expect(this.saveButton).toBeVisible();
    }
}