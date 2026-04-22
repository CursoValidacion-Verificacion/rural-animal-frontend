import { test } from '@playwright/test';
import { LoginPage, VetAppointmentsPage } from '../pages';
import usersData from '../data/users.json';

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
    await page.waitForFunction(() => !!localStorage.getItem('access_token') && !!localStorage.getItem('auth_user'), {
      timeout: 15_000,
    });
    await vetAppointmentsPage.goto();
  });

  test('Debe mostrar correctamente la página de citas veterinarias', async () => {
    await vetAppointmentsPage.expectAppointmentsPageVisible();
  });

  test('Debe bloquear la confirmación hasta seleccionar veterinario', async () => {
    test.setTimeout(60_000);

    await vetAppointmentsPage.expectSubmitDisabledWithoutVeterinarianSelection();
  });
});
