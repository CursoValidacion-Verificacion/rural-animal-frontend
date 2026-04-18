import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages';
import usersData from '../data/users.json';
import { generateUniqueEmail } from '../utils/auth.helper';

/**
 * Suite de registro de nuevos usuarios.
 * Cubre el happy path de creación de cuenta y los principales casos de error
 * de validación del formulario (campos obligatorios, formatos, coincidencia de contraseñas).
 */
test.describe('Registro de Usuario @signup', () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.goto();
  });

  test('Debe mostrar el formulario de registro con todos los campos', async () => {
    await signupPage.expectFormVisible();
    await expect(signupPage.lastName1Input).toBeVisible();
    await expect(signupPage.identificationInput).toBeVisible();
    await expect(signupPage.phoneNumberInput).toBeVisible();
    await expect(signupPage.birthDateInput).toBeVisible();
    await expect(signupPage.roleSelect).toBeVisible();
    await expect(signupPage.confirmPasswordInput).toBeVisible();
  });

  test('Debe registrar un nuevo usuario exitosamente - Happy Path', async ({ page }) => {
    test.setTimeout(60_000); // Este test depende de API externa + registro backend
    const uniqueEmail = generateUniqueEmail();
    const userData = { ...usersData.newUser, email: uniqueEmail };

    await signupPage.fillForm(userData);
    await signupPage.submitForm();

    await page.waitForURL(/\/(login|app\/)/, { timeout: 30_000 });
    const currentUrl = page.url();
    const redirectedCorrectly = currentUrl.includes('/login') || currentUrl.includes('/app/');
    expect(redirectedCorrectly).toBeTruthy();
  });

  test('Debe mostrar errores de validación con campos vacíos', async () => {
    // Se tocan y desenfoca los campos para activar las validaciones del formulario
    await signupPage.nameInput.click();
    await signupPage.nameInput.blur();
    await signupPage.emailInput.click();
    await signupPage.emailInput.blur();

    await signupPage.expectValidationError('Este campo es obligatorio');
  });

  test('Debe validar formato de cédula costarricense (9 dígitos)', async () => {
    await signupPage.identificationInput.fill('123');
    await signupPage.identificationInput.blur();

    await signupPage.expectValidationError('La cédula debe tener 9 dígitos sin guiones');
  });

  test('Debe validar que las contraseñas coincidan', async () => {
    await signupPage.passwordInput.fill('Password1');
    await signupPage.confirmPasswordInput.fill('DifferentPass');
    await signupPage.confirmPasswordInput.blur();

    await signupPage.expectValidationError('Las contraseñas no coinciden');
  });

  test('Debe validar formato de teléfono costarricense', async () => {
    await signupPage.phoneNumberInput.fill('1234');
    await signupPage.phoneNumberInput.blur();

    await signupPage.expectValidationError('Tomar en cuenta formato tico, sin guiones');
  });

  test('Debe validar que el usuario sea mayor de 18 años', async () => {
    const today = new Date();
    const minorDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    const dateStr = minorDate.toISOString().split('T')[0];

    await signupPage.birthDateInput.fill(dateStr);
    await signupPage.birthDateInput.blur();

    await signupPage.expectValidationError('Debe tener al menos 18 años');
  });

  test('Debe navegar al login al hacer click en el botón de iniciar sesión', async ({ page }) => {
    await signupPage.loginButton.click();
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });
});
