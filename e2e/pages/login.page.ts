import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la página de inicio de sesión.
 * Agrupa todos los locators del formulario de login y expone métodos
 * para realizar acciones e verificar estados de validación.
 */
export class LoginPage extends BasePage {
  /** Campo de texto para el correo electrónico. */
  readonly emailInput: Locator;
  /** Campo de texto para la contraseña. */
  readonly passwordInput: Locator;
  /** Botón principal para enviar el formulario de login. */
  readonly loginButton: Locator;
  /** Botón para alternar la visibilidad de la contraseña. */
  readonly togglePasswordButton: Locator;
  /** Botón para iniciar sesión con Google. */
  readonly googleLoginButton: Locator;
  /** Enlace de recuperación de contraseña. */
  readonly forgotPasswordLink: Locator;
  /** Enlace para ir a la página de registro. */
  readonly signupLink: Locator;
  /** Botón de acceso rápido al inicio (esquina de la pantalla). */
  readonly homeButton: Locator;
  /** Botón de acceso rápido al registro (esquina de la pantalla). */
  readonly registerButton: Locator;
  /** Mensaje de error de validación del campo email. */
  readonly emailError: Locator;
  /** Mensaje de error de validación del campo contraseña. */
  readonly passwordError: Locator;
  /** Mensaje de error general tras un intento de login fallido. */
  readonly loginError: Locator;
  /** Logo de la aplicación en la página de login. */
  readonly logo: Locator;

  /**
   * @param page - Instancia de la página de Playwright inyectada desde el test.
   */
  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button.register-btn');
    this.togglePasswordButton = page.locator('.toggle-password');
    this.googleLoginButton = page.locator('.google-login-btn');
    this.forgotPasswordLink = page.locator('.forgot-password');
    this.signupLink = page.locator('.signup-link a');
    this.homeButton = page.locator('.corner-home-btn');
    this.registerButton = page.locator('.corner-register-btn');
    this.emailError = page.locator('#email-error');
    this.passwordError = page.locator('#password-error');
    this.loginError = page.locator('p.text-danger[role="alert"]');
    this.logo = page.locator('h1.logo');
  }

  /** Navega a la página de login. */
  async goto(): Promise<void> {
    await this.navigateTo('/login');
  }

  /**
   * Rellena el formulario con las credenciales indicadas y hace clic en el botón de login.
   *
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña del usuario.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Activa la validación del formulario sin enviarlo, simulando que el usuario
   * tocó los campos y los dejó vacíos (foco y desenfoque).
   */
  async triggerValidation(): Promise<void> {
    await this.emailInput.click();
    await this.passwordInput.click();
    await this.emailInput.click();
    await this.emailInput.blur();
  }

  /**
   * Verifica que el mensaje de error del campo email contenga el texto esperado.
   *
   * @param message - Texto que debe aparecer en el mensaje de error.
   */
  async expectEmailError(message: string): Promise<void> {
    const errorDiv = this.page.locator('#email-error, .invalid-feedback').filter({ hasText: message });
    await expect(errorDiv.first()).toBeVisible({ timeout: 5_000 });
  }

  /**
   * Verifica que el mensaje de error del campo contraseña contenga el texto esperado.
   *
   * @param message - Texto que debe aparecer en el mensaje de error.
   */
  async expectPasswordError(message: string): Promise<void> {
    const errorDiv = this.page.locator('#password-error, .invalid-feedback').filter({ hasText: message });
    await expect(errorDiv.first()).toBeVisible({ timeout: 5_000 });
  }

  /**
   * Verifica que el mensaje de error general de login sea visible y contenga el texto esperado.
   *
   * @param message - Texto que debe aparecer en el mensaje de error de login.
   */
  async expectLoginError(message: string): Promise<void> {
    await expect(this.loginError).toBeVisible();
    await expect(this.loginError).toContainText(message);
  }

  /**
   * Verifica que los elementos principales del formulario de login
   * (email, contraseña y botón) sean visibles en pantalla.
   */
  async expectLoginFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
