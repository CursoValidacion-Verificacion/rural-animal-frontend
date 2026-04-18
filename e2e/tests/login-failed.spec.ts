import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import usersData from '../data/users.json';

/**
 * Suite de escenarios negativos del login.
 * Cubre validaciones client-side (campos vacíos, contraseña corta, botón deshabilitado)
 * y respuestas de error del servidor ante credenciales inválidas.
 */
test.describe('Login Fallido - Escenarios Negativos @login @negative', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Debe mostrar error de validación cuando el email está vacío', async () => {
    await loginPage.emailInput.click();
    await loginPage.passwordInput.click();

    await loginPage.expectEmailError('Por favor ingresa tu correo electrónico');
  });

  test('Debe mostrar error de validación cuando la contraseña está vacía', async () => {
    await loginPage.passwordInput.click();
    await loginPage.emailInput.click();

    await loginPage.expectPasswordError('Por favor ingresa tu contraseña');
  });

  test('Debe mostrar error del servidor al enviar un email con formato inválido', async ({ page }) => {
    // El formulario solo valida que el campo no esté vacío (required).
    // Al enviar un email con formato incorrecto, el servidor responde con error.
    await loginPage.login('formato-invalido', 'Password123!');

    await expect(loginPage.loginError).toBeVisible({ timeout: 10_000 });
  });

  test('Debe mostrar error cuando la contraseña es muy corta', async () => {
    await loginPage.passwordInput.fill('123');
    await loginPage.emailInput.click();

    await loginPage.expectPasswordError('La contraseña debe tener al menos 6 caracteres');
  });

  test('Debe mantener el botón de login deshabilitado con formulario inválido', async () => {
    // Sin llenar nada, el botón debe estar deshabilitado
    await expect(loginPage.loginButton).toBeDisabled();

    // Con solo email, sigue deshabilitado
    await loginPage.emailInput.fill('test@test.com');
    await expect(loginPage.loginButton).toBeDisabled();

    // Con ambos campos válidos, se habilita
    await loginPage.passwordInput.fill('123456');
    await expect(loginPage.loginButton).toBeEnabled();
  });

  // Recorre las credenciales inválidas del JSON que tengan email y contraseña mínima
  for (const invalidUser of usersData.invalidUsers.filter(u => u.email && u.password.length >= 6)) {
    test(`Debe mostrar error del servidor con: ${invalidUser.description}`, async ({ page }) => {
      await loginPage.login(invalidUser.email, invalidUser.password);

      const loginError = page.locator('p.text-danger');
      await expect(loginError).toBeVisible({ timeout: 10_000 });

      // No debe redirigir fuera del login
      expect(page.url()).toContain('/login');
    });
  }

  test('Debe permanecer en la página de login tras un intento fallido', async ({ page }) => {
    await loginPage.login('noexiste@test.com', 'wrongpass123');

    // Pausa breve para que la respuesta del servidor se procese
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/login');
    await loginPage.expectLoginFormVisible();
  });
});
