import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object que representa las vistas de publicaciones y ventas dentro de la aplicación.
 * Cubre tanto la sección `/app/publications` (publicaciones del vendedor) como
 * `/app/sales` (historial de ventas).
 */
export class PublicationsPage extends BasePage {
  /** Botón para crear una nueva publicación. */
  readonly newPublicationButton: Locator;
  /** Componente que lista las publicaciones del usuario. */
  readonly publicationsList: Locator;
  /** Componente de paginación de la lista de publicaciones. */
  readonly pagination: Locator;
  /** Botón para volver a la vista anterior. */
  readonly backButton: Locator;
  /** Indicador de carga mientras se obtienen los datos. */
  readonly loader: Locator;
  /** Componente que lista las ventas realizadas. */
  readonly salesList: Locator;
  /** Componente que muestra el detalle de una venta. */
  readonly salesDetails: Locator;

  /**
   * @param page - Instancia de la página de Playwright inyectada desde el test.
   */
  constructor(page: Page) {
    super(page);
    this.newPublicationButton = page.locator('#nueva-publicacion');
    this.publicationsList = page.locator('app-publications-list');
    this.pagination = page.locator('app-pagination');
    this.backButton = page.locator('.back-button');
    this.loader = page.locator('app-loader');
    this.salesList = page.locator('app-sales-list');
    this.salesDetails = page.locator('app-sales-details');
  }

  /** Navega a la sección de publicaciones del usuario autenticado. */
  async goto(): Promise<void> {
    await this.navigateTo('/app/publications');
  }

  /** Navega a la sección de ventas del usuario autenticado. */
  async gotoSales(): Promise<void> {
    await this.navigateTo('/app/sales');
  }

  /** Verifica que el listado de publicaciones sea visible en pantalla. */
  async expectPublicationsListVisible(): Promise<void> {
    await expect(this.publicationsList).toBeVisible();
  }

  /** Verifica que el listado de ventas sea visible en pantalla. */
  async expectSalesListVisible(): Promise<void> {
    await expect(this.salesList).toBeVisible();
  }

  /** Verifica que el botón para crear una nueva publicación sea visible. */
  async expectNewPublicationButtonVisible(): Promise<void> {
    await expect(this.newPublicationButton).toBeVisible();
  }
}
