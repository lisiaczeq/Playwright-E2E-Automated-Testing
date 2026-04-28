//test zawiera manualny scroll przez page.evaluate, który był konieczny ze względu na specyfikę kontenera UI

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';
const USERNAME = 'username';
const PASSWORD = 'password';

test.beforeEach(async ({ page }) => {
  page.on('request', request => {
    if (request.method() !== 'GET') {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', async response => {
    const request = response.request();
    if (request.method() !== 'GET') {
      console.log(`[RESPONSE] ${response.status()} ${request.method()} ${response.url()}`);
    }
  });
});

async function login(page) {
  await page.goto(BASE_URL);
  await page.getByRole('textbox', { name: 'Login' }).fill(USERNAME);
  await page.getByRole('textbox', { name: 'Hasło' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 0').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

test('organizational structure', async ({ page }) => {
  await login(page);
  
  await page.getByRole('link', { name: 'Struktura' }).click();
  
  await page.getByRole('button', { name: 'Dodaj nową' }).click();
  await page.locator('span').filter({ hasText: 'Nazwa (obowiązkowe)' }).locator('#undefined').fill('a');
  await page.locator('span').filter({ hasText: 'Symbol (obowiązkowe)' }).locator('#undefined').click();
  await page.locator('span').filter({ hasText: 'Symbol (obowiązkowe)' }).locator('#undefined').fill('a');
  await page.locator('p-dropdown').filter({ hasText: 'Wybierz z listy' }).getByLabel('dropdown trigger').click();
  await page.getByRole('option', { name: 'Brak' }).click();
  await page.locator('span').filter({ hasText: 'Jednostka planistyczna' }).locator('div').nth(2).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByRole('option', { name: 'Brak' }).getByRole('paragraph').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('gridcell', { name: 'a', exact: true }).nth(1).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(500);
  await page.getByLabel('Usuń jednostkę').getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(500);
});

test('test', async ({ page }) => {
  
  test.setTimeout(120000);
  await login(page);
  
  await page.getByRole('link', { name: 'Struktura', exact: true }).click();
  
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.dx-scrollable-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });
  
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.dx-scrollable-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  });

  await page.getByRole('button', { name: 'Dodaj nową', exact: true }).click();
  
  await page.waitForSelector('atomics-text-input[formcontrolname="name"] input');
  await page.locator('atomics-text-input[formcontrolname="name"] input').fill('a');
  await page.locator('atomics-text-input[formcontrolname="symbol"] input').fill('ABC');
  
  await page.locator('.p-dropdown-trigger').first().click();
  await page.getByRole('option', { name: 'WB', exact: true }).click();
  await page.getByRole('button', { name: 'Dalej', exact: true }).click();
  await page.getByRole('button', { name: 'Dalej', exact: true }).click();
  
  await page.locator('.p-dropdown-trigger').first().click();
  await page.getByRole('option', { name: 'JP', exact: true }).click();
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.dx-scrollable-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });
  
  await page.getByText('ABC', { exact: true }).click();
  await page.getByRole('button', { name: 'Dodaj nową', exact: true }).click();
  
  await page.waitForSelector('atomics-text-input[formcontrolname="name"] input');
  await page.locator('atomics-text-input[formcontrolname="name"] input').fill('b');
  await page.locator('atomics-text-input[formcontrolname="symbol"] input').fill('DEF');
  
  await page.locator('.p-dropdown-trigger').first().click();
  await page.getByRole('option', { name: 'WB', exact: true }).click();
  
  await page.locator('atomics-checkbox[formcontrolname="isLeaf"] .p-checkbox-box').click();
  
  await page.getByRole('button', { name: 'Dalej', exact: true }).click();
  await page.getByRole('button', { name: 'Dalej', exact: true }).click();
  
  await page.locator('.p-dropdown-trigger').first().click();
  await page.getByRole('option', { name: 'JB', exact: true }).click();
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click();
  
  await page.getByText('ABC', { exact: true }).click();
  
  await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('.dx-treelist-cell-expandable'));
    const abcCell = cells.find(cell => cell.textContent.includes('ABC'));
    if (abcCell) {
      const collapseButton = abcCell.querySelector('.dx-treelist-collapsed');
      if (collapseButton) {
        collapseButton.click();
      }
    }
  });
  
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.dx-scrollable-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });
  
  await page.getByText('DEF', { exact: true }).click();
  await page.getByRole('button', { name: 'Usuń', exact: true }).click();
  await page.getByLabel('Usuń jednostkę', { exact: true }).getByRole('button', { name: 'Usuń', exact: true }).click();

  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.dx-scrollable-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  });
  
  await page.waitForTimeout(2000);

  for (let i = 0; i < 50; i++) {
    const isVisible = await page.getByText('ABC', { exact: true }).isVisible();
  
    if (isVisible) {
      await page.getByText('ABC', { exact: true }).click();
      console.log('Found and clicked ABC');
      break; 
    }
  
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('.dx-scrollable-container');
      if (scrollContainer) {
        scrollContainer.scrollTop += 30; 
      }
    });
  
    await page.waitForTimeout(200); 
  }

  await page.waitForTimeout(2000);
  
  await page.getByText('ABC', { exact: true }).click();
  await page.getByRole('button', { name: 'Edytuj', exact: true }).click();
  
  await page.waitForSelector('atomics-checkbox[formcontrolname="isLeaf"] .p-checkbox-box');
  await page.locator('atomics-checkbox[formcontrolname="isLeaf"] .p-checkbox-box').click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click();
  
  await page.getByRole('button', { name: 'Usuń', exact: true }).click();
  await page.getByLabel('Usuń jednostkę', { exact: true }).getByRole('button', { name: 'Usuń', exact: true }).click();
  await page.waitForTimeout(1000);
});