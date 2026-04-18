import { type Page, type Locator } from '@playwright/test';

/**
 * Clase base abstracta para todos los Page Objects de los tests E2E.
 * Centraliza las acciones comunes de navegación e interacción con la página,
 * evitando duplicar código en cada page object específico.
 */
export abstract class BasePage {
  /**
   * @param page - Instancia de la página de Playwright inyectada desde cada test.
   */
  constructor(protected readonly page: Page) {}

  /**
   * Navega a la ruta indicada y espera a que la red esté inactiva
   * antes de continuar, asegurando que la página cargó completamente.
   *
   * @param path - Ruta o URL destino.
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Espera hasta que la URL del navegador coincida con el patrón dado.
   * Útil para confirmar redirecciones después de acciones como el login.
   *
   * @param urlPattern - Cadena exacta o expresión regular con la URL esperada.
   */
  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout: 30_000 });
  }

  /**
   * Obtiene el contenido de texto de un locator.
   * Devuelve una cadena vacía si el elemento no tiene texto.
   *
   * @param locator - Locator del elemento a leer.
   * @returns El texto del elemento, o '' si es nulo.
   */
  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }

  /**
   * Comprueba si un elemento es visible en pantalla.
   *
   * @param locator - Locator del elemento a verificar.
   * @returns `true` si el elemento está visible, `false` en caso contrario.
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Hace clic en un elemento y, si se proporciona un patrón de URL,
   * espera a que la navegación hacia esa URL se complete.
   *
   * @param locator - Locator del elemento a clickear.
   * @param urlPattern - (Opcional) URL esperada tras la navegación.
   */
  async clickAndWait(locator: Locator, urlPattern?: string | RegExp): Promise<void> {
    await locator.click();
    if (urlPattern) {
      await this.waitForUrl(urlPattern);
    }
  }
}
