import { test } from '@playwright/test';
import { LoginPage, VetAppointmentsPage } from '../pages';
import usersData from '../data/users.json';
import vetAppointmentsData from '../data/vet-appointments-data.json';

/**
 * Suite de pruebas E2E para citas veterinarias.
 * Valida creación de citas, historial y validaciones negativas.
 */
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

        await page.waitForURL(/\/app\//, { timeout: 15_000 });
        await vetAppointmentsPage.goto();
    });

    test('Debe mostrar correctamente la página de citas veterinarias', async () => {
        await vetAppointmentsPage.expectAppointmentsPageVisible();
    });

    test('Debe permitir agendar una cita veterinaria correctamente', async () => {
        await vetAppointmentsPage.createAppointment(
            vetAppointmentsData.validAppointment.petName,
            vetAppointmentsData.validAppointment.date,
            vetAppointmentsData.validAppointment.time,
            vetAppointmentsData.validAppointment.reason
        );

        await vetAppointmentsPage.expectSuccessMessage(vetAppointmentsData.validAppointment.successMessage);
        await vetAppointmentsPage.expectAppointmentInHistory(vetAppointmentsData.validAppointment.petName);
    });

    test('Debe mostrar error al intentar agendar una cita con datos vacíos', async () => {
        await vetAppointmentsPage.createAppointment(
            vetAppointmentsData.invalidAppointment.petName,
            vetAppointmentsData.invalidAppointment.date,
            vetAppointmentsData.invalidAppointment.time,
            vetAppointmentsData.invalidAppointment.reason
        );

        await vetAppointmentsPage.expectErrorMessage(vetAppointmentsData.invalidAppointment.errorMessage);
    });
});