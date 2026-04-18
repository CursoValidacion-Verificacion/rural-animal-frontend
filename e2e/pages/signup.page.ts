import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la página de registro de nuevos usuarios.
 * Agrupa los locators de todos los campos del formulario de alta y expone métodos
 * para rellenar el formulario, enviarlo y verificar errores de validación.
 */
export class SignupPage extends BasePage {
  /** Campo de texto para el nombre del usuario. */
  readonly nameInput: Locator;
  /** Campo de texto para el primer apellido. */
  readonly lastName1Input: Locator;
  /** Campo de texto para el segundo apellido (opcional). */
  readonly lastName2Input: Locator;
  /** Campo de texto para el número de identificación. */
  readonly identificationInput: Locator;
  /** Campo de texto para el correo electrónico. */
  readonly emailInput: Locator;
  /** Campo de texto para la contraseña. */
  readonly passwordInput: Locator;
  /** Campo de texto para confirmar la contraseña. */
  readonly confirmPasswordInput: Locator;
  /** Campo de texto para el número de teléfono. */
  readonly phoneNumberInput: Locator;
  /** Campo de fecha para la fecha de nacimiento. */
  readonly birthDateInput: Locator;
  /** Selector desplegable para elegir el rol del usuario (comprador/vendedor). */
  readonly roleSelect: Locator;
  /** Botón para enviar el formulario y crear la cuenta. */
  readonly createButton: Locator;
  /** Botón para cancelar el registro y volver atrás. */
  readonly cancelButton: Locator;
  /** Botón de acceso rápido al inicio (esquina de la pantalla). */
  readonly homeButton: Locator;
  /** Botón de acceso rápido al login (esquina de la pantalla). */
  readonly loginButton: Locator;

  /**
   * @param page - Instancia de la página de Playwright inyectada desde el test.
   */
  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#name');
    this.lastName1Input = page.locator('#lastName1');
    this.lastName2Input = page.locator('#lastName2');
    this.identificationInput = page.locator('#identification');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.phoneNumberInput = page.locator('#phoneNumber');
    this.birthDateInput = page.locator('#birthDate');
    this.roleSelect = page.locator('#role');
    this.createButton = page.locator('#crear');
    this.cancelButton = page.locator('#cancelar');
    this.homeButton = page.locator('.corner-home-btn');
    this.loginButton = page.locator('.corner-register-btn');
  }

  /** Navega a la página de registro de usuarios. */
  async goto(): Promise<void> {
    await this.navigateTo('/signup');
  }

  /**
   * Rellena todos los campos del formulario de registro con los datos proporcionados.
   * Incluye la selección de provincia, cantón y distrito, que se cargan de forma
   * asíncrona desde una API externa. Por ello se espera a que cada selector tenga
   * opciones disponibles antes de interactuar con él, y se despacha el evento `change`
   * manualmente para que Angular procese el cambio correctamente.
   *
   * @param userData - Objeto con los datos del usuario a registrar.
   */
  async fillForm(userData: {
    name: string;
    lastName1: string;
    lastName2?: string;
    identification: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    birthDate: string;
    role: string;
  }): Promise<void> {
    await this.nameInput.fill(userData.name);
    await this.lastName1Input.fill(userData.lastName1);
    if (userData.lastName2) {
      await this.lastName2Input.fill(userData.lastName2);
    }
    await this.identificationInput.fill(userData.identification);
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.confirmPassword);
    await this.phoneNumberInput.fill(userData.phoneNumber);
    await this.birthDateInput.fill(userData.birthDate);
    await this.roleSelect.selectOption(userData.role);

    // Llenar dirección (campos obligatorios)
    // Las provincias se cargan de una API externa (ubicaciones.paginasweb.cr).
    // Angular necesita un ciclo de change detection para renderizarlas.
    // Si no aparecen en 10s, recargamos la página como fallback.
    try {
      await this.page.waitForFunction(
        () => document.querySelectorAll('#province option').length > 1,
        { timeout: 10_000 },
      );
    } catch {
      // Las provincias no cargaron (bug en ngOnChanges del componente).
      // Recargamos y re-llenamos todo el formulario.
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.nameInput.fill(userData.name);
      await this.lastName1Input.fill(userData.lastName1);
      if (userData.lastName2) {
        await this.lastName2Input.fill(userData.lastName2);
      }
      await this.identificationInput.fill(userData.identification);
      await this.emailInput.fill(userData.email);
      await this.passwordInput.fill(userData.password);
      await this.confirmPasswordInput.fill(userData.confirmPassword);
      await this.phoneNumberInput.fill(userData.phoneNumber);
      await this.birthDateInput.fill(userData.birthDate);
      await this.roleSelect.selectOption(userData.role);
      await this.page.waitForFunction(
        () => document.querySelectorAll('#province option').length > 1,
        { timeout: 20_000 },
      );
    }

    // selectOption cambia el DOM pero no dispara el handler (change) de Angular.
    // Combinamos selectOption + dispatchEvent para que Angular procese el cambio.
    await this.page.locator('#province').selectOption({ index: 1 });
    await this.page.waitForTimeout(500);
    await this.page.evaluate(() => {
      document.querySelector('#province')?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Esperar a que se carguen los cantones (API externa)
    await this.page.waitForFunction(() => document.querySelectorAll('#canton option').length > 1, { timeout: 20_000 });

    await this.page.locator('#canton').selectOption({ index: 1 });
    await this.page.waitForTimeout(500);
    await this.page.evaluate(() => {
      document.querySelector('#canton')?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Esperar a que se carguen los distritos
    await this.page.waitForFunction(() => document.querySelectorAll('#district option').length > 1, {
      timeout: 20_000,
    });

    await this.page.locator('#district').selectOption({ index: 1 });
    await this.page.waitForTimeout(500);
    await this.page.evaluate(() => {
      document.querySelector('#district')?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Otras señas
    const otherDetails = this.page.locator('#otherDetails');
    await otherDetails.fill('Dirección de prueba E2E');
  }

  /** Envía el formulario de registro haciendo clic en el botón de crear cuenta. */
  async submitForm(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * Verifica que los campos principales del formulario de registro
   * (nombre, email, contraseña y botón de crear) sean visibles en pantalla.
   */
  async expectFormVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  /**
   * Verifica que aparezca en pantalla un mensaje de error de validación
   * que contenga el texto indicado.
   *
   * @param text - Texto del mensaje de error esperado.
   */
  async expectValidationError(text: string): Promise<void> {
    const error = this.page.locator('.text-danger', { hasText: text }).first();
    await expect(error).toBeVisible();
  }
}
