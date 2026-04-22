import { test } from '@playwright/test';
import { LoginPage, ProfilePage } from '../pages';
import usersData from '../data/users.json';
import profileData from '../data/profile-data.json';

/**
 * Suite de pruebas E2E para perfil de usuario.
 * Valida visualización, edición correcta y validaciones negativas.
 */
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

    await page.waitForURL(/\/app\//, { timeout: 15_000 });
    await page.waitForFunction(() => !!localStorage.getItem('access_token') && !!localStorage.getItem('auth_user'), {
      timeout: 15_000,
    });
    await profilePage.goto();
  });

  test('Debe mostrar correctamente la página de perfil del usuario', async () => {
    await profilePage.expectProfilePageVisible();
  });

  test('Debe mostrar error al intentar guardar datos inválidos', async () => {
    await profilePage.fillInvalidProfileData(
      profileData.invalidProfileUpdate.firstName,
      profileData.invalidProfileUpdate.lastName,
      profileData.invalidProfileUpdate.phone
    );

    await profilePage.expectValidationErrorsVisible();
  });
});
