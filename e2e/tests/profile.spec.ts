import { test, expect } from '@playwright/test';
import { LoginPage, ProfilePage } from '../pages';
import usersData from '../data/users.json';
import profileData from '../data/profile-data.json';

test.describe('Perfil de Usuario @profile @e2e', () => {
    let loginPage: LoginPage;
    let profilePage: ProfilePage;

    const buyerUser = usersData.validUsers.find(user => user.role === 'BUYER');

    test.beforeEach(async ({ page }) => {
        if (!buyerUser) {
            throw new Error('No se encontró un usuario BUYER en users.json');
        }

        loginPage = new LoginPage(page);
        profilePage = new ProfilePage(page);

        await loginPage.goto();
        await loginPage.login(buyerUser.email, buyerUser.password);

        await page.waitForURL(/\/app\//, { timeout: 15000 });
        await profilePage.goto();
        await profilePage.expectProfilePageVisible();
    });

    test('Debe mostrar correctamente la página de perfil del usuario', async () => {
        await expect(profilePage.profileTitle).toBeVisible();
        await expect(profilePage.editButton).toBeVisible();
    });

    test('Debe permitir entrar en modo edición', async () => {
        await profilePage.clickEdit();
        await profilePage.expectEditModeVisible();
    });

    test('Debe permitir actualizar el perfil con datos válidos', async () => {
        await profilePage.updateBasicProfile({
            name: profileData.validProfileUpdate.name,
            lastName1: profileData.validProfileUpdate.lastName1,
            lastName2: profileData.validProfileUpdate.lastName2,
            identification: profileData.validProfileUpdate.identification,
            birthDate: profileData.validProfileUpdate.birthDate,
            phoneNumber: profileData.validProfileUpdate.phoneNumber
        });

        await profilePage.expectSuccessMessage(profileData.successMessage);
    });

    test('Debe mostrar errores al intentar guardar datos inválidos', async () => {
        await profilePage.clickEdit();

        await profilePage.fillName(profileData.invalidProfileUpdate.name);
        await profilePage.fillLastName1(profileData.invalidProfileUpdate.lastName1);
        await profilePage.fillIdentification(profileData.invalidProfileUpdate.identification);
        await profilePage.fillBirthDate(profileData.invalidProfileUpdate.birthDate);
        await profilePage.fillPhoneNumber(profileData.invalidProfileUpdate.phoneNumber);

        await profilePage.clickSave();

        await profilePage.expectAnyValidationError();
    });

    test('Debe permitir cancelar la edición', async () => {
        await profilePage.clickEdit();
        await profilePage.fillName('Temporal');
        await profilePage.clickCancel();

        await expect(profilePage.saveButton).toBeHidden();
        await expect(profilePage.cancelButton).toBeHidden();
        await expect(profilePage.editButton).toBeVisible();
    });
});