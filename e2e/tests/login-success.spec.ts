import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import usersData from '../data/users.json';

/**
 * Suite del happy path de login.
 * Verifica que los usuarios válidos inician sesión correctamente,
 * que el token se persiste en localStorage y que los elementos del formulario
 * se muestran como se espera.
 */
test.describe('Login Exitoso - Happy Path @login @happy', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // Recorre los usuarios válidos del JSON y prueba el login con cada uno
  for (const user of usersData.validUsers) {
    test(`Debe iniciar sesión correctamente con ${user.description}`, async ({ page }) => {
      await loginPage.expectLoginFormVisible();

      await loginPage.login(user.email, user.password);

      await page.waitForURL(/\/app\//, { timeout: 15_000 });

      const currentUrl = page.url();
      expect(currentUrl).toContain('/app/');

      // El token se guarda de forma asíncrona; se espera a que aparezca en localStorage
      await page.waitForFunction(() => localStorage.getItem('access_token') !== null, { timeout: 10_000 });

      const token = await page.evaluate(() => localStorage.getItem('access_token'));
      expect(token).toBeTruthy();

      const authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
      expect(authUser).toBeTruthy();

      if (authUser) {
        const parsedUser = JSON.parse(authUser);
        expect(parsedUser.email).toBe(user.email);
      }
    });
  }

  test('Debe mostrar el formulario de login con todos sus elementos', async () => {
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.logo).toContainText('RuralAnimal');
    await loginPage.expectLoginFormVisible();
    await expect(loginPage.googleLoginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.signupLink).toBeVisible();
    await expect(loginPage.homeButton).toBeVisible();
  });

  test('Debe poder alternar la visibilidad de la contraseña', async () => {
    await loginPage.passwordInput.fill('miPassword');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    await loginPage.togglePasswordButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

    await loginPage.togglePasswordButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
