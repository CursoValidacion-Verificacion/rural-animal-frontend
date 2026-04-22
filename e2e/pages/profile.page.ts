import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la página de perfil de usuario.
 * Agrupa los locators relacionados con la visualización y edición
 * de datos personales del usuario autenticado.
 */
export class ProfilePage extends BasePage {
    /** Campo de texto para el nombre del usuario (modo edición). */
    readonly firstNameInput: Locator;
    /** Campo de texto para el primer apellido del usuario (modo edición). */
    readonly lastNameInput: Locator;
    /** Campo de texto para el teléfono del usuario (modo edición). */
    readonly phoneInput: Locator;
    /** Botón para guardar los cambios del perfil. */
    readonly saveButton: Locator;
    /** Botón para editar el perfil. */
    readonly editButton: Locator;
    /** Título o encabezado de la página de perfil. */
    readonly profileTitle: Locator;
    /** Error inline de nombre en modo edición. */
    readonly nameErrorMessage: Locator;
    /** Error inline de primer apellido en modo edición. */
    readonly lastNameErrorMessage: Locator;
    /** Error inline de teléfono en modo edición. */
    readonly phoneErrorMessage: Locator;
    /** Valor mostrado de nombre en modo lectura. */
    readonly firstNameDisplay: Locator;
    /** Valor mostrado de primer apellido en modo lectura. */
    readonly lastNameDisplay: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('input[placeholder="Ingresa tu nombre"]');
        this.lastNameInput = page.locator('input[placeholder="Ingresa tu primer apellido"]');
        this.phoneInput = page.locator('input[placeholder="Ingresa tu número de teléfono"]');
        this.saveButton = page.locator('button#crear');
        this.editButton = page.locator('button.btn.btn-warning');
        this.profileTitle = page.locator('h1').filter({ hasText: /perfil del usuario/i });
        this.nameErrorMessage = page.locator('.error').filter({ hasText: /nombre no puede estar vacío/i });
        this.lastNameErrorMessage = page.locator('.error').filter({ hasText: /primer apellido no puede estar vacío/i });
        this.phoneErrorMessage = page.locator('.error').filter({ hasText: /número de teléfono no puede estar vacío|debe contener 8 dígitos/i });
        this.firstNameDisplay = page.locator('label:has-text("Nombre")').locator('xpath=../p');
        this.lastNameDisplay = page.locator('label:has-text("Primer Apellido")').locator('xpath=../p');
    }

    /** Navega a la página de perfil. */
    async goto(): Promise<void> {
        await this.navigateTo('/app/profile');
    }

    /**
     * Hace clic en el botón de editar perfil, si la interfaz lo requiere.
     */
    async clickEdit(): Promise<void> {
        await expect(this.editButton).toBeVisible();
        await this.editButton.click();
        await expect(this.firstNameInput).toBeVisible();
    }

    /**
     * Actualiza los datos del perfil del usuario.
     *
     * @param firstName - Nuevo nombre.
     * @param lastName - Nuevo apellido.
     * @param phone - Nuevo teléfono.
     */
    async updateProfile(
        firstName: string,
        lastName: string,
        phone: string
    ): Promise<{ status: number; body: unknown }> {
        await this.clickEdit();
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.phoneInput.fill(phone);

        const patchResponsePromise = this.page.waitForResponse(
            (response) => {
                if (response.request().method() !== 'PATCH') return false;
                return /\/users\/\d+$/.test(new URL(response.url()).pathname);
            },
            { timeout: 20_000 }
        );

        await this.saveButton.click();
        const patchResponse = await patchResponsePromise;
        const status = patchResponse.status();
        const body = await patchResponse.json().catch(() => null);

        await expect(this.profileTitle).toBeVisible({ timeout: 20_000 });
        await expect(this.editButton).toBeVisible({ timeout: 20_000 });
        await this.page.waitForLoadState('domcontentloaded');

        return { status, body };
    }

    /**
     * Verifica que los datos mostrados en modo lectura coincidan.
     */
    async expectProfileValues(firstName: string, lastName: string): Promise<void> {
        await expect(this.firstNameDisplay).toContainText(firstName, { timeout: 20_000 });
        await expect(this.lastNameDisplay).toContainText(lastName, { timeout: 20_000 });
    }

    /**
     * Fuerza errores de validación en modo edición con datos inválidos.
     */
    async fillInvalidProfileData(firstName: string, lastName: string, phone: string): Promise<void> {
        await this.clickEdit();
        await this.firstNameInput.fill(firstName);
        await this.firstNameInput.blur();
        await this.lastNameInput.fill(lastName);
        await this.lastNameInput.blur();
        await this.phoneInput.fill(phone);
        await this.phoneInput.blur();
    }

    /**
     * Verifica que los elementos principales de la página de perfil estén visibles.
     */
    async expectProfilePageVisible(): Promise<void> {
        await expect(this.profileTitle).toBeVisible();
        await expect(this.editButton).toBeVisible();
        await expect(this.firstNameDisplay).toBeVisible();
        await expect(this.lastNameDisplay).toBeVisible();
    }

    /**
     * Verifica errores de validación esperados en edición de perfil.
     */
    async expectValidationErrorsVisible(): Promise<void> {
        await expect(this.nameErrorMessage).toBeVisible();
        await expect(this.lastNameErrorMessage).toBeVisible();
        await expect(this.phoneErrorMessage).toBeVisible();
    }
}
