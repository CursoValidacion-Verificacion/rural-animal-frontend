import { type Page } from '@playwright/test';
import { ENV } from '../config/env.config';

/** Estructura de la respuesta del endpoint de autenticación. */
interface AuthTokenResponse {
  token: string;
  expiresIn: number;
  authUser: Record<string, unknown>;
}

/**
 * Hace login contra la API y guarda los tokens en el localStorage del navegador,
 * dejando la sesión lista sin pasar por la pantalla de login.
 * Se usa en los tests que necesitan partir directamente desde una sesión autenticada.
 *
 * @param page - Instancia de la página de Playwright.
 * @param email - Correo electrónico del usuario.
 * @param password - Contraseña del usuario.
 * @throws Error si el endpoint de login responde con un estado no exitoso.
 */
export async function loginViaApi(page: Page, email: string, password: string): Promise<void> {
  const response = await page.request.post(`${ENV.API_URL}/auth/login`, {
    data: { email, password },
  });

  if (!response.ok()) {
    throw new Error(`El login por API falló con estado ${response.status()}`);
  }

  const body: AuthTokenResponse = await response.json();

  await page.evaluate(data => {
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('expiresIn', String(data.expiresIn));
    localStorage.setItem('auth_user', JSON.stringify(data.authUser));
  }, body);
}

/**
 * Elimina los tokens de autenticación del localStorage,
 * dejando la sesión cerrada para el siguiente test.
 *
 * @param page - Instancia de la página de Playwright.
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('auth_user');
  });
}

/**
 * Genera un correo único usando el timestamp actual.
 * Se usa en los tests de registro para evitar colisiones con usuarios ya existentes.
 *
 * @returns Correo con formato `e2etest_<timestamp>@test.com`.
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  return `e2etest_${timestamp}@test.com`;
}
