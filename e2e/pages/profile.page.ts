import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la página de perfil de usuario.
 * Agrupa los locators relacionados con la visualización y edición
 * de datos personales del usuario autenticado.
 */
export class ProfilePage extends BasePage {
    /** Campo de texto para el nombre del usuario. */
    readonly firstNameInput: Locator;
    /** Campo de texto para el apellido del usuario. */
    readonly lastNameInput: Locator;
    /** Campo de texto para el teléfono del usuario. */
    readonly phoneInput: Locator;
    /** Campo de texto para la dirección del usuario. */
    readonly addressInput: Locator;
    /** Botón para guardar los cambios del perfil. */
    readonly saveButton: Locator;
    /** Botón para editar el perfil, en caso de existir. */
    readonly editButton: Locator;
    /** Mensaje de éxito al actualizar el perfil. */
    readonly successMessage: Locator;
    /** Mensaje general de error del formulario. */
    readonly errorMessage: Locator;
    /** Título o encabezado de la página de perfil. */
    readonly profileTitle: Locator;

    /**
     * @param page - Instancia de la página de Playwright inyectada desde el test.
     */
    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('#firstName, input[formcontrolname="firstName"]');
        this.lastNameInput = page.locator('#lastName, input[formcontrolname="lastName"]');
        this.phoneInput = page.locator('#phone, input[formcontrolname="phone"]');
        this.addressInput = page.locator('#address, textarea[formcontrolname="address"]');
        this.saveButton = page.locator('button:has-text("Guardar"), button[type="submit"]');
        this.editButton = page.locator('button:has-text("Editar")');
        this.successMessage = page.locator('.alert-success, .toast-success, .success-message');
        this.errorMessage = page.locator('.alert-danger, .text-danger, .error-message');
        this.profileTitle = page.locator('h1, h2').filter({ hasText: /perfil/i });
    }

    /** Navega a la página de perfil. */
    async goto(): Promise<void> {
        await this.navigateTo('/profile');
    }

    /**
     * Hace clic en el botón de editar perfil, si la interfaz lo requiere.
     */
    async clickEdit(): Promise<void> {
        if (await this.editButton.isVisible()) {
            await this.editButton.click();
        }
    }

    /**
     * Actualiza los datos del perfil del usuario.
     *
     * @param firstName - Nuevo nombre.
     * @param lastName - Nuevo apellido.
     * @param phone - Nuevo teléfono.
     * @param address - Nueva dirección.
     */
    async updateProfile(
        firstName: string,
        lastName: string,
        phone: string,
        address: string
    ): Promise<void> {
        await this.clickEdit();
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.phoneInput.fill(phone);
        await this.addressInput.fill(address);
        await this.saveButton.click();
    }

    /**
     * Verifica que el perfil se haya actualizado correctamente.
     *
     * @param message - Texto esperado del mensaje de éxito.
     */
    async expectSuccessMessage(message: string): Promise<void> {
        await expect(this.successMessage).toBeVisible();
        await expect(this.successMessage).toContainText(message);
    }

    /**
     * Verifica que se muestre un mensaje de error en la actualización del perfil.
     *
     * @param message - Texto esperado del mensaje de error.
     */
    async expectErrorMessage(message: string): Promise<void> {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toContainText(message);
    }

    /**
     * Verifica que los elementos principales de la página de perfil estén visibles.
     */
    async expectProfilePageVisible(): Promise<void> {
        await expect(this.profileTitle).toBeVisible();
        await expect(this.firstNameInput).toBeVisible();
        await expect(this.lastNameInput).toBeVisible();
        await expect(this.saveButton).toBeVisible();
    }
}