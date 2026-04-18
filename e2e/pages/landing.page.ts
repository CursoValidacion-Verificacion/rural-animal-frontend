import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la página de landing (página principal pública).
 * Encapsula los locators de las secciones hero, beneficios, servicios y pie de página,
 * así como los accesos directos al login y al registro desde la barra de navegación.
 */
export class LandingPage extends BasePage {
  /** Título principal de la sección hero. */
  readonly heroTitle: Locator;
  /** Subtítulo descriptivo de la sección hero. */
  readonly heroSubtitle: Locator;
  /** Botón CTA principal del hero para iniciar sesión. */
  readonly loginCta: Locator;
  /** Enlace de login en la barra de navegación. */
  readonly navLoginLink: Locator;
  /** Enlace de registro en la barra de navegación. */
  readonly navRegisterLink: Locator;
  /** Sección de beneficios de la plataforma. */
  readonly benefitsSection: Locator;
  /** Título de la sección de beneficios. */
  readonly benefitsTitle: Locator;
  /** Sección de servicios ofrecidos. */
  readonly servicesSection: Locator;
  /** Título de la sección de servicios. */
  readonly servicesTitle: Locator;
  /** Pie de página de la landing. */
  readonly footer: Locator;
  /** Logo de la plataforma. */
  readonly logo: Locator;
  /** Botón de registro alternativo. */
  readonly registerButton: Locator;

  /**
   * @param page - Instancia de la página de Playwright inyectada desde el test.
   */
  constructor(page: Page) {
    super(page);
    this.heroTitle = page.locator('#hero-texto');
    this.heroSubtitle = page.locator('#hero-texto2');
    this.loginCta = page.locator('#btn-inicia');
    this.navLoginLink = page.locator('a[routerLink="/login"]').first();
    this.navRegisterLink = page.locator('a[routerLink="/signup"]').first();
    this.benefitsSection = page.locator('#beneficios');
    this.benefitsTitle = page.locator('#beneficios-plataforma');
    this.servicesSection = page.locator('#servicios');
    this.servicesTitle = page.locator('#titulo-servicios');
    this.footer = page.locator('#pie-pagina');
    this.logo = page.locator('#rural');
    this.registerButton = page.locator('.register-button');
  }

  /** Navega a la página de landing. */
  async goto(): Promise<void> {
    await this.navigateTo('/landing-page');
  }

  /**
   * Verifica que el título del hero sea visible y contenga el texto esperado
   * "Mercado de Animales".
   */
  async expectHeroVisible(): Promise<void> {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroTitle).toContainText('Mercado de Animales');
  }

  /** Hace clic en el botón CTA principal del hero para ir al login. */
  async clickLoginCta(): Promise<void> {
    await this.loginCta.click();
  }

  /** Hace clic en el enlace de login de la barra de navegación. */
  async clickNavLogin(): Promise<void> {
    await this.navLoginLink.click();
  }

  /** Hace clic en el enlace de registro de la barra de navegación. */
  async clickNavRegister(): Promise<void> {
    await this.navRegisterLink.click();
  }

  /**
   * Verifica que las secciones principales de la landing (hero, beneficios y servicios)
   * sean visibles en pantalla.
   */
  async expectAllSectionsVisible(): Promise<void> {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.benefitsSection).toBeVisible();
    await expect(this.servicesSection).toBeVisible();
  }
}
