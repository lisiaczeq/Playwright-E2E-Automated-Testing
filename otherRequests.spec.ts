import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';
const USERNAME = 'username';
const PASSWORD = 'password';

async function login(page) {
  await page.goto(BASE_URL);
  await page.fill('input[type="text"]', USERNAME);
  await page.fill('input[type="password"]', PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

test('adding and deleting other requests', async ({ page }) => {
  await login(page);
  await page.waitForURL('**/start', { timeout: 10000 });
  await page.waitForTimeout(3000);

  await page.getByRole('button', { name: 'Inne wnioski' }).locator('a').click();
  await page.getByRole('link', { name: 'Wnioski wysłane'}).click();

  await page.getByText('Wyjście prywatne').click();
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.getByRole('gridcell', { name: '1', exact: true }).locator('span').click();
  await page.getByRole('combobox', { name: 'Wybierz z listy' }).click();
  await page.locator('.p-dropdown-items [role="option"]').last().click();

  const [response] = await Promise.all([
    page.waitForResponse(resp =>
      resp.url().includes('/requests/PRIVATE') && resp.request().method() === 'POST'
    ),
    page.getByRole('button', { name: 'Zapisz' }).click()
  ]);

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  console.log('Odpowiedź z POST:', responseBody);
});