import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';
const USERNAME = 'haslo';
const WRONG_PASSWORD = 'haslo';

test('intercepting API response during login', async ({ page }) => {
  let loginResponse;

  page.on('response', async (response) => {
    if (response.url().includes('/login')) {
      loginResponse = response;
      console.log('STATUS:', response.status());
    }
  });

  await page.goto(`${BASE_URL}/start`);
  await page.fill('input[type="text"]', USERNAME);
  await page.fill('input[type="password"]', WRONG_PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.waitForTimeout(1000);

  expect(loginResponse).toBeDefined();
  expect([401, 403, 400]).toContain(loginResponse?.status());
});
