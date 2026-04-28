import { test, expect } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'http://127.0.0.1';
const USERNAME = 'username';
const PASSWORD = 'password';
const FILE_PATH = './tests/test.xml';

async function login(page) {
  await page.goto(BASE_URL);
  await page.getByRole('textbox', { name: 'Login' }).fill(USERNAME);
  await page.getByRole('textbox', { name: 'Hasło' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

test.beforeEach(async ({ page }) => {
  page.on('request', request => {
    if (request.method() !== 'GET') {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', async response => {
    const request = response.request();
    if (request.method() !== 'GET') {
      const status = response.status();
      const url = request.url();
      const method = request.method();

      console.log(`[RESPONSE] ${status} ${method} ${url}`);

      if (status !== 200) {
        console.warn(`[RESPONSE ERROR] Expected 200 but got ${status} for ${method} ${url}`);
      }
    }
  });
});

test('PlanistaParametry', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Parametry' }).click();
  
  await page.locator('label:has-text("Aktualny rok jako domyślny:")').locator('xpath=../div/atomics-select-input//div[@role="button"]').click();
  
  await page.getByRole('option', { name: 'Nie' }).click();
  await page.getByRole('button', { name: 'Zapisz' }).first().click();
  
  await page.locator('label:has-text("Aktualny rok jako domyślny:")').locator('xpath=../div/atomics-select-input//div[@role="button"]').click();
  
  await page.getByRole('option', { name: 'Tak' }).click();
  await page.getByRole('button', { name: 'Zapisz' }).first().click();
  await page.getByRole('button', { name: 'Wczytaj plik XML z Bestii' }).click();
  
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('span').filter({ hasText: 'Wybierz plik' }).nth(1).click()
  ]);
  
  await fileChooser.setFiles(FILE_PATH);
  
  await page.getByRole('button', { name: 'Wczytaj', exact: true }).click();
  await page.getByText('Zamknij').click();
  await page.waitForTimeout(2000);
});