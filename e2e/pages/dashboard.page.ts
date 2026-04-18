import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa la vista del dashboard de la aplicación.
 * Encapsula los locators del sidebar y el contenido principal,
 * y expone métodos para verificar el estado de la página y navegar entre secciones.
 */
export class DashboardPage extends BasePage {
  /** Contenedor principal del sidebar de navegación lateral. */
  readonly sidebar: Locator;
  /** Botón para expandir o contraer el sidebar. */
  readonly toggleSidebarButton: Locator;
  /** Todos los enlaces de navegación dentro del sidebar. */
  readonly sidebarLinks: Locator;
  /** Contenedor del contenido principal de la página. */
  readonly mainContent: Locator;
  /** Contenedor del logo ubicado en el sidebar. */
  readonly logoWrapper: Locator;

  /**
   * @param page - Instancia de la página de Playwright inyectada desde el test.
   */
  constructor(page: Page) {
    super(page);
    this.sidebar = page.locator('.sidebar-wrapper');
    this.toggleSidebarButton = page.locator('.toggle-sidebar');
    this.sidebarLinks = page.locator('.sidebar-link');
    this.mainContent = page.locator('main.container-fluid');
    this.logoWrapper = page.locator('.logo-wrapper');
  }

  /**
   * Verifica que el dashboard cargó correctamente comprobando que la URL
   * coincide con `/app/` y que el sidebar y el contenido principal son visibles.
   */
  async expectDashboardLoaded(): Promise<void> {
    await this.page.waitForURL(/\/app\//);
    await expect(this.sidebar).toBeVisible();
    await expect(this.mainContent).toBeVisible();
  }

  /**
   * Obtiene el texto de todos los enlaces del sidebar.
   *
   * @returns Array con los textos recortados de cada enlace visible en el sidebar.
   */
  async getSidebarLinkTexts(): Promise<string[]> {
    const links = await this.sidebarLinks.all();
    const texts: string[] = [];
    for (const link of links) {
      const text = await link.textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }

  /**
   * Hace clic en el enlace del sidebar cuyo texto coincida con el nombre de sección dado.
   *
   * @param sectionName - Texto del enlace de la sección a la que se quiere navegar.
   */
  async navigateToSection(sectionName: string): Promise<void> {
    const link = this.sidebarLinks.filter({ hasText: sectionName });
    await link.click();
  }

  /**
   * Verifica que el enlace de la sección indicada tenga la clase `active`,
   * confirmando que es la sección actualmente activa en el sidebar.
   *
   * @param sectionName - Texto del enlace cuya clase activa se quiere verificar.
   */
  async expectSectionActive(sectionName: string): Promise<void> {
    const link = this.sidebarLinks.filter({ hasText: sectionName });
    await expect(link).toHaveClass(/active/);
  }
}
