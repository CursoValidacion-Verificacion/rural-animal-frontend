import { type Page, test, expect } from '@playwright/test';
import { LoginPage, VetAppointmentsPage } from '../pages';
import usersData from '../data/users.json';
import { ENV } from '../config/env.config';

interface AvailabilityApiResponse {
  data?: Array<{
    date: string;
  }>;
  message?: string;
}

function parseStoredJsonValue<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

async function getAuthToken(page: Page): Promise<string> {
  const tokenRaw = await page.evaluate(() => localStorage.getItem('access_token'));
  const token = parseStoredJsonValue<string>(tokenRaw);

  if (!token) {
    throw new Error('No se pudo obtener access_token desde localStorage.');
  }

  return token;
}

async function fetchAvailability(page: Page, token: string): Promise<AvailabilityApiResponse> {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 3);
  endDate.setHours(23, 59, 59, 0);

  const response = await page.request.get(`${ENV.API_URL}/veterinary_appointments/availability`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      startDate: formatLocalDateTime(startDate),
      endDate: formatLocalDateTime(endDate),
    },
  });

  const rawBody = await response.text();

  if (!response.ok()) {
    throw new Error(
      `GET /veterinary_appointments/availability devolvió ${response.status()}. Body: ${rawBody}`
    );
  }

  const payload = JSON.parse(rawBody) as AvailabilityApiResponse;

  if (!payload.data || payload.data.length === 0) {
    throw new Error(
      `GET /veterinary_appointments/availability devolvió data vacía para el rango solicitado. Body: ${rawBody}`
    );
  }

  return payload;
}

/**
 * Suite de pruebas E2E para citas veterinarias.
 * Valida creación de citas, historial y validaciones negativas.
 */
test.describe('Citas Veterinarias @vet @e2e', () => {
  let loginPage: LoginPage;
  let vetAppointmentsPage: VetAppointmentsPage;

  const buyerUser = usersData.validUsers.find(user => user.role === 'BUYER');

  test.beforeEach(async ({ page }) => {
    if (!buyerUser) {
      throw new Error('No se encontró un usuario BUYER en users.json');
    }

    loginPage = new LoginPage(page);
    vetAppointmentsPage = new VetAppointmentsPage(page);

    await loginPage.goto();
    await loginPage.login(buyerUser.email, buyerUser.password);

    await page.waitForURL(/\/app\//, { timeout: 15_000 });
    await page.waitForFunction(() => !!localStorage.getItem('access_token') && !!localStorage.getItem('auth_user'), {
      timeout: 15_000,
    });
    await vetAppointmentsPage.goto();
  });

  test('Debe mostrar correctamente la página de citas veterinarias', async () => {
    await vetAppointmentsPage.expectAppointmentsPageVisible();
  });

  test('Debe bloquear la confirmación hasta seleccionar veterinario', async ({ page }) => {
    test.setTimeout(60_000);
    const token = await getAuthToken(page);
    const availability = await fetchAvailability(page, token);

    expect(availability.data?.length ?? 0).toBeGreaterThan(0);

    await vetAppointmentsPage.expectSubmitDisabledWithoutVeterinarianSelection();
  });
});
