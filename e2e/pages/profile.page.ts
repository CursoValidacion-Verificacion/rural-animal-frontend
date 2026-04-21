import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProfilePage extends BasePage {
    readonly profileTitle: Locator;
    readonly editButton: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;

    readonly nameInput: Locator;
    readonly lastName1Input: Locator;
    readonly lastName2Input: Locator;
    readonly identificationInput: Locator;
    readonly birthDateInput: Locator;
    readonly phoneNumberInput: Locator;
    readonly vcoInput: Locator;

    readonly validationErrors: Locator;

    constructor(page: Page) {
        super(page);

        this.profileTitle = page.locator('h1').filter({ hasText: 'Perfil del usuario' });

        this.editButton = page.locator('button.btn.btn-warning');
        this.saveButton = page.locator('#crear');
        this.cancelButton = page.locator('#cancelar');

        this.nameInput = page.locator('input[placeholder="Ingresa tu nombre"]');
        this.lastName1Input = page.locator('input[placeholder="Ingresa tu primer apellido"]');
        this.lastName2Input = page.locator('input[placeholder="Ingresa tu segundo apellido"]');
        this.identificationInput = page.locator('input[placeholder="Ingresa tu número de cédula"]');
        this.birthDateInput = page.locator('input[type="date"]');
        this.phoneNumberInput = page.locator('input[placeholder="Ingresa tu número de teléfono"]');
        this.vcoInput = page.locator('input[placeholder="Ingresa tu número de certificado de SENASA"]');

        this.validationErrors = page.locator('.error');
    }

    async goto(): Promise<void> {
        await this.navigateTo('/app/profile');
    }

    async clickEdit(): Promise<void> {
        await expect(this.editButton).toBeVisible();
        await this.editButton.click();
        await expect(this.saveButton).toBeVisible();
        await expect(this.cancelButton).toBeVisible();
    }

    async clickSave(): Promise<void> {
        await expect(this.saveButton).toBeVisible();
        await this.saveButton.click();
    }

    async clickCancel(): Promise<void> {
        await expect(this.cancelButton).toBeVisible();
        await this.cancelButton.click();
    }

    async fillName(value: string): Promise<void> {
        await this.nameInput.fill(value);
    }

    async fillLastName1(value: string): Promise<void> {
        await this.lastName1Input.fill(value);
    }

    async fillLastName2(value: string): Promise<void> {
        await this.lastName2Input.fill(value);
    }

    async fillIdentification(value: string): Promise<void> {
        await this.identificationInput.fill(value);
    }

    async fillBirthDate(value: string): Promise<void> {
        await this.birthDateInput.fill(value);
    }

    async fillPhoneNumber(value: string): Promise<void> {
        await this.phoneNumberInput.fill(value);
    }

    async fillVco(value: string): Promise<void> {
        if (await this.vcoInput.isVisible()) {
            await this.vcoInput.fill(value);
        }
    }

    async updateBasicProfile(data: {
        name: string;
        lastName1: string;
        lastName2?: string;
        identification?: string;
        birthDate?: string;
        phoneNumber: string;
    }): Promise<void> {
        await this.clickEdit();

        await this.fillName(data.name);
        await this.fillLastName1(data.lastName1);

        if (data.lastName2 !== undefined) {
            await this.fillLastName2(data.lastName2);
        }

        if (data.identification !== undefined) {
            await this.fillIdentification(data.identification);
        }

        if (data.birthDate !== undefined) {
            await this.fillBirthDate(data.birthDate);
        }

        await this.fillPhoneNumber(data.phoneNumber);

        await this.clickSave();
    }

    async expectProfilePageVisible(): Promise<void> {
        await expect(this.profileTitle).toBeVisible();
        await expect(this.editButton).toBeVisible();
    }

    async expectEditModeVisible(): Promise<void> {
        await expect(this.nameInput).toBeVisible();
        await expect(this.lastName1Input).toBeVisible();
        await expect(this.phoneNumberInput).toBeVisible();
        await expect(this.saveButton).toBeVisible();
        await expect(this.cancelButton).toBeVisible();
    }

    async expectAnyValidationError(): Promise<void> {
        await expect(this.validationErrors.first()).toBeVisible();
    }

    async expectValidationMessage(text: string): Promise<void> {
        await expect(this.page.getByText(text, { exact: false })).toBeVisible();
    }

    async expectSuccessMessage(text: string): Promise<void> {
        await expect(this.page.getByText(text, { exact: false })).toBeVisible();
    }

    async expectViewModeValue(label: string, expectedValue: string): Promise<void> {
        const container = this.page.locator(`div.border-bottom.my-3:has(label:text-is("${label}"))`);
        await expect(container.locator('p')).toContainText(expectedValue);
    }
}