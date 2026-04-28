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

test('file download', async ({ page }) => {
  await login(page);
  await page.waitForURL('**/start', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  await page.getByRole('link', { name: 'Dokumenty elektr.' }).click();
  
  await page.getByRole('gridcell', { name: 'Skierowanie na okresowe' }).click();

  const popup1Promise = page.waitForEvent('popup');
  const download1Promise = page.waitForEvent('download');

  await page.locator('app-other-attachments').getByRole('button', { name: 'Pobierz' }).click();

  const popup1 = await popup1Promise;
  const download1 = await download1Promise;

  await download1.saveAs(`downloads/skierowanie-${Date.now()}.pdf`);

  await page.getByRole('gridcell', { name: 'Zaświadczenie o odbyciu' }).click();

  const popup2Promise = page.waitForEvent('popup');
  const download2Promise = page.waitForEvent('download');

  await page.locator('app-other-attachments').getByRole('button', { name: 'Pobierz' }).click();

  const popup2 = await popup2Promise;
  const download2 = await download2Promise;

  await download2.saveAs(`downloads/zaswiadczenie-${Date.now()}.pdf`);

});
