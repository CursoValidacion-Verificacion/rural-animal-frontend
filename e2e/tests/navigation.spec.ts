import { test, expect } from '@playwright/test';
import { LandingPage, LoginPage, DashboardPage } from '../pages';
import usersData from '../data/users.json';

/**
 * Suite de navegación entre las vistas públicas y privadas de la aplicación.
 * Cubre el flujo Landing → Login → Dashboard, las redirecciones del AuthGuard
 * y los accesos directos desde la barra de navegación.
 */
test.describe('Navegación Landing → Login → Dashboard @navigation', () => {
  test('Debe mostrar la landing page con todas sus secciones', async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();

    await landingPage.expectHeroVisible();
    await expect(landingPage.heroSubtitle).toBeVisible();
    await expect(landingPage.loginCta).toBeVisible();
    await expect(landingPage.benefitsSection).toBeVisible();
    await expect(landingPage.servicesSection).toBeVisible();
    await expect(landingPage.footer).toBeVisible();
  });

  test('Debe navegar de Landing a Login usando el CTA principal', async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();

    await landingPage.clickLoginCta();
    await page.waitForURL(/\/login/);

    const loginPage = new LoginPage(page);
    await loginPage.expectLoginFormVisible();
  });

  test('Debe navegar de Landing a Signup usando el link de registro', async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();

    await landingPage.clickNavRegister();
    await page.waitForURL(/\/signup/);

    expect(page.url()).toContain('/signup');
  });

  test('Flujo completo: Landing → Login → Dashboard → Sidebar', async ({ page }) => {
    const user = usersData.validUsers[0];

    // 1. Inicia en la landing page
    const landingPage = new LandingPage(page);
    await landingPage.goto();
    await landingPage.expectHeroVisible();

    // 2. Navega al login
    await landingPage.clickLoginCta();
    await page.waitForURL(/\/login/);

    // 3. Hace login
    const loginPage = new LoginPage(page);
    await loginPage.expectLoginFormVisible();
    await loginPage.login(user.email, user.password);

    // 4. Verifica que llega al dashboard
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectDashboardLoaded();

    // 5. Verifica que el sidebar tiene enlaces de navegación
    const sidebarTexts = await dashboardPage.getSidebarLinkTexts();
    expect(sidebarTexts.length).toBeGreaterThan(0);
  });

  test('Debe redirigir al landing desde la raíz "/"', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/landing-page/);
    expect(page.url()).toContain('/landing-page');
  });

  test('Debe redirigir a login si intenta acceder a /app sin autenticación', async ({ page }) => {
    await page.goto('/app/publications');

    // El AuthGuard redirige al login cuando no hay sesión activa
    await page.waitForURL(/\/(login|landing-page)/, { timeout: 10_000 });
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/landing-page');
    expect(isRedirected).toBeTruthy();
  });
});
