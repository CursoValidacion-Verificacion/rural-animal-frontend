import { test, expect } from '@playwright/test';
import { DashboardPage, PublicationsPage, LoginPage } from '../pages';
import usersData from '../data/users.json';

/**
 * Suite de publicaciones y ventas.
 * Verifica que cada rol accede a las secciones correspondientes del sidebar
 * y que los componentes principales cargan correctamente tras el login.
 */
test.describe('Ver Publicaciones y Ventas @publications @sales', () => {
  test.describe('Publicaciones (usuario con acceso)', () => {
    // Se usa el adminUser porque tiene acceso garantizado a la sección de Publicaciones
    const adminUser = usersData.adminUser;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(adminUser.email, adminUser.password);
      await page.waitForURL(/\/app\//, { timeout: 30_000 });
      await page.waitForFunction(() => localStorage.getItem('access_token') !== null, { timeout: 10_000 });
    });

    test('Debe cargar la vista de publicaciones correctamente', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.expectDashboardLoaded();

      // Se navega por el sidebar para que el flujo sea más realista que ir directo por URL
      await dashboard.navigateToSection('Publicaciones');
      await page.waitForURL(/\/app\/publications/, { timeout: 15_000 });

      const pubsPage = new PublicationsPage(page);
      await expect(pubsPage.publicationsList).toBeVisible({ timeout: 15_000 });
    });

    test('Debe mostrar el botón de nueva publicación para el seller', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.expectDashboardLoaded();

      await dashboard.navigateToSection('Publicaciones');
      await page.waitForURL(/\/app\/publications/, { timeout: 15_000 });

      const pubsPage = new PublicationsPage(page);
      await expect(pubsPage.newPublicationButton).toBeVisible({ timeout: 15_000 });
    });

    test('Debe poder navegar entre secciones del sidebar', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.expectDashboardLoaded();

      const sidebarTexts = await dashboard.getSidebarLinkTexts();
      expect(sidebarTexts.length).toBeGreaterThan(0);

      // Navega al perfil, que es accesible para todos los roles
      await dashboard.navigateToSection('Perfil');
      await page.waitForURL(/\/app\/profile/);
      expect(page.url()).toContain('/app/profile');
    });
  });

  test.describe('Ventas (rol Buyer)', () => {
    const buyer = usersData.validUsers.find(u => u.role === 'BUYER')!;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(buyer.email, buyer.password);
      await page.waitForURL(/\/app\//, { timeout: 30_000 });
      await page.waitForFunction(() => localStorage.getItem('access_token') !== null, { timeout: 10_000 });
    });

    test('Debe cargar la vista de ventas correctamente', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.expectDashboardLoaded();

      await dashboard.navigateToSection('Ventas');
      await page.waitForURL(/\/app\/sales/, { timeout: 15_000 });

      const pubsPage = new PublicationsPage(page);
      await expect(pubsPage.salesList).toBeVisible({ timeout: 15_000 });
    });

    test('Debe mostrar la navegación del sidebar según el rol buyer', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.expectDashboardLoaded();

      const sidebarTexts = await dashboard.getSidebarLinkTexts();

      // El rol buyer debe ver estas secciones en su sidebar
      expect(sidebarTexts.some(t => t.includes('Ventas'))).toBeTruthy();
      expect(sidebarTexts.some(t => t.includes('Subastas'))).toBeTruthy();
      expect(sidebarTexts.some(t => t.includes('Carrito'))).toBeTruthy();
    });
  });
});
