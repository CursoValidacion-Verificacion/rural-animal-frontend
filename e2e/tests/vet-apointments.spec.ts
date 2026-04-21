import { test, expect } from '@playwright/test';
import { LoginPage, VetAppointmentsPage } from '../pages';
import usersData from '../data/users.json';
import vetAppointmentsData from '../data/vet-appointments-data.json';

test.describe('Citas Veterinarias @vet @e2e', () => {
    let loginPage: LoginPage;
    let vetAppointmentsPage: VetAppointmentsPage;

    const buyerUser = usersData.validUsers.find(user => user.role === 'BUYER');

    test.beforeEach(async ({ page }) => {
        if (!buyerUser) {
            throw new Error('No se encontró un usuario BUYER en users.json');
        }

        loginPage = new LoginPage(page);
        vetAppointmentsPage = new VetAppointmentsPage(page);

        await loginPage.goto();
        await loginPage.login(buyerUser.email, buyerUser.password);

        await page.waitForURL(/\/app\//, { timeout: 15000 });
        await vetAppointmentsPage.goto();
        await vetAppointmentsPage.expectAppointmentsPageVisible();
    });

    test('Debe mostrar correctamente la página de citas veterinarias', async () => {
        await vetAppointmentsPage.expectAppointmentsPageVisible();
    });

    test('Debe permitir ver el historial de citas', async () => {
        await vetAppointmentsPage.expectAppointmentsHistoryVisible();

        if (vetAppointmentsData.history?.title) {
            await vetAppointmentsPage.expectHistoryContainsText(
                vetAppointmentsData.history.title
            );
        }
    });

    test('Debe mostrar el flujo de selección de fecha, hora y veterinario', async () => {
        await vetAppointmentsPage.openScheduleAppointmentTab();
        await vetAppointmentsPage.expectSchedulingWizardVisible();

        await vetAppointmentsPage.selectFirstAvailableDate();
        await vetAppointmentsPage.expectTimeStepVisible();

        await vetAppointmentsPage.selectFirstAvailableTimeSlot();
        await vetAppointmentsPage.expectVeterinarianStepVisible();
    });

    test('Debe permitir agendar una cita veterinaria correctamente', async () => {
        await vetAppointmentsPage.scheduleAppointmentWithFirstAvailableOptions();

        if (vetAppointmentsData.validAppointment?.successMessage) {
            await vetAppointmentsPage.expectSuccessMessage(
                vetAppointmentsData.validAppointment.successMessage
            );
        }
    });

    test('No debe permitir confirmar una cita sin seleccionar veterinario', async () => {
        await vetAppointmentsPage.openScheduleAppointmentTab();
        await vetAppointmentsPage.expectSchedulingWizardVisible();

        await vetAppointmentsPage.selectFirstAvailableDate();
        await vetAppointmentsPage.expectTimeStepVisible();

        await vetAppointmentsPage.selectFirstAvailableTimeSlot();
        await vetAppointmentsPage.expectVeterinarianStepVisible();

        await expect(vetAppointmentsPage.confirmButton).toBeDisabled();
    });
});