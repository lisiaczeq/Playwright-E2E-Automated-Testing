import { test, expect } from '@playwright/test';


const BASE_URL = 'http://127.0.0.1';
const UNIT_NAME = 'unit';
const USERNAME = 'username';
const PASSWORD = 'password';

const ZALACZNIK = './tests/test.txt';

const FINANCE_UNIT = 'unit1';


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

async function login(page, unitName: string) {
  await page.goto(BASE_URL);
  await page.getByRole('textbox', { name: 'Login' }).fill(USERNAME);
  await page.getByRole('textbox', { name: 'Hasło' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByText(unitName).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

async function selectLastOptionInEachMultiselect(page) {
  const multiselects = await page.locator('p-multiselect:visible').all();
  for (const multiselect of multiselects) {
    const trigger = multiselect.locator('.p-multiselect-trigger');
    await trigger.click({ timeout: 500 });

    const options = page.locator('.p-multiselect-items-wrapper li:visible');
    const count = await options.count();
    if (count === 0) continue;

    await options.nth(count - 1).click({ timeout: 500 });
    await page.mouse.click(0, 0);
    await page.waitForTimeout(200);
  }
}

async function checkAllVisibleTristateCheckboxes(page) {
  const checkboxes = await page.locator('p-tristatecheckbox').all();
  for (const checkbox of checkboxes) {
    const box = checkbox.locator('.p-checkbox-box');
    const ariaChecked = await box.getAttribute('aria-checked');
    const isDisabled = await box.evaluate(el => el.classList.contains('p-disabled'));

    if (!isDisabled && ariaChecked !== 'true') {
      await box.click();
    }
  }
}


test('dysponentDokumentyZaangazowaniaUmowy', async ({ page }) => {
  test.setTimeout(180000); 

  await login(page, UNIT_NAME);
  
  await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Zadania bieżące' }).click();
  
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('button.p-button:has-text("Zamknij")').click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('timesicon').first().click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.getByLabel('1').getByText('1').click();

  await page.locator('atomics-select-input:has(label:text("Rodzaj")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('atomics-select-input:has(label:text("Typ")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('label:text("Tytuł")').locator('..').locator('input[type="text"]').fill('ABC');
  await page.locator('label:text("Numer na umowie")').locator('..').locator('input[type="text"]').fill('1234');
  await page.locator('label:text("Numer własny")').locator('..').locator('input[type="text"]').fill('1111');

  await page.getByRole('main').getByRole('spinbutton').click();
  await page.waitForTimeout(1000);
  await page.locator('.p-inputnumber-input').fill('2');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.locator('button.pb-btn-primary--new:has-text("Dodaj plan")').click();
  await page.locator('label:text("Klasyfikacja")').locator('..').locator('.p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.locator('p-inputnumber').getByRole('spinbutton').click();
  await page.locator('.p-inputnumber-input').fill('2');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Przypisz kontrahenta do umowy' }).click();
  await page.waitForTimeout(1000);
  await page.locator('tr.dx-row.dx-data-row').last().locator('td[role="gridcell"]:nth-child(2)').click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Wybierz', { exact: true }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(2).click();
  
  await page.getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.waitForTimeout(2000);
  await page.locator('atomics-text-input:has(label:text("Nazwa załącznika")) input[type="text"]').fill('test');
  await page.locator('span:has-text("Wybierz plik") input[type="file"]').setInputFiles(ZALACZNIK);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('atomics-select-input:has(label:text("Rodzaj zabezpieczenia")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.getByRole('main').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(2000);
  
  await page.locator('#splitter').getByRole('button', { name: 'Edytuj', exact: true }).click();
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.locator('#splitter').getByRole('button', { name: 'Edytuj', exact: true }).click();
  await page.locator('span').filter({ hasText: 'Tytuł' }).locator('#undefined').click();
  await page.locator('span').filter({ hasText: 'Tytuł' }).locator('#undefined').fill('ABCD');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByText('Zamknij').click();
  
  await page.getByRole('button', { name: 'Podgląd historii' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));

  await page.getByRole('button', { name: 'Podgląd historii' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: 'Weryfikacja' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Drukuj' }).nth(2).click();
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Drukuj' }).nth(3).click();
  await page.waitForTimeout(5000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  

  await page.getByRole('button', { name: 'Utwórz kopię' }).click();
  await page.waitForTimeout(5000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click()))); 
  
  await page.getByRole('button', { name: 'Stan realizacji' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Stan realizacji' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Drukuj umowę' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Drukuj umowę' }).click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Drukuj' }).nth(2).click();
  await page.waitForTimeout(5000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(2000); 
  
  await page.getByRole('button', { name: 'Drukuj zestawienie' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Drukuj zestawienie' }).click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Drukuj' }).nth(2).click();
  await page.waitForTimeout(10000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(2000);

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(2000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Usuń' }).first().click(); 
  const dialog = page.getByRole('dialog', { name: 'Uwaga' });
  await dialog.getByText('Czy na pewno chcesz usunąć umowę?').waitFor();
  await dialog.getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Usuń' }).first().click();
  const dialog2 = page.getByRole('dialog', { name: 'Uwaga' });
  await dialog2.getByText('Czy na pewno chcesz usunąć umowę?').waitFor();
  await dialog2.getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(2000);
});


test('dysponentDokumentyZaangazowaniaZlecenia', async ({ page }) => {
  test.setTimeout(180000); 

  await login(page, UNIT_NAME);
  
  await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Zlecenia' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();

  await page.locator('label:text("Tytuł")').locator('..').locator('input[type="text"]').fill('ABC');
  await page.locator('label:text("Numer własny")').locator('..').locator('input[type="text"]').fill('1111');

  await page.getByRole('main').getByRole('spinbutton').click();
  await page.waitForTimeout(1000);
  await page.locator('.p-inputnumber-input').fill('2');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.locator('button.pb-btn-primary--new:has-text("Dodaj plan")').click();
  await page.locator('label:text("Klasyfikacja")').locator('..').locator('.p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.locator('p-inputnumber').getByRole('spinbutton').click();
  await page.locator('.p-inputnumber-input').fill('2');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Przypisz kontrahenta do umowy' }).click();
  await page.waitForTimeout(1000);
  await page.locator('tr.dx-row.dx-data-row').last().locator('td[role="gridcell"]:nth-child(2)').click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Wybierz', { exact: true }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(2).click();
  
  await page.getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.waitForTimeout(2000);
  await page.locator('atomics-text-input:has(label:text("Nazwa załącznika")) input[type="text"]').fill('test');
  await page.locator('span:has-text("Wybierz plik") input[type="file"]').setInputFiles(ZALACZNIK);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('atomics-select-input:has(label:text("Rodzaj zabezpieczenia")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.getByRole('main').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(2000);
  
  await page.locator('#splitter').getByRole('button', { name: 'Edytuj', exact: true }).click();
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.locator('#splitter').getByRole('button', { name: 'Edytuj', exact: true }).click();
  await page.locator('span').filter({ hasText: 'Tytuł' }).locator('#undefined').click();
  await page.locator('span').filter({ hasText: 'Tytuł' }).locator('#undefined').fill('ABCD');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByText('Zamknij').click();
  
  await page.getByRole('button', { name: 'Podgląd historii' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));

  await page.getByRole('button', { name: 'Podgląd historii' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('main').getByRole('tab', { name: 'Weryfikacja' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Drukuj' }).nth(2).click();
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Drukuj' }).nth(3).click();
  await page.waitForTimeout(5000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Stan realizacji' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Stan realizacji' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Drukuj zlecenie' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Drukuj zlecenie' }).click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Drukuj' }).nth(2).click();
  await page.waitForTimeout(5000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(2000); 
  
  await page.getByRole('button', { name: 'Drukuj zestawienie' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Drukuj zestawienie' }).click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Drukuj' }).nth(2).click();
  await page.waitForTimeout(10000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(2000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtracja zaawansowana' }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
  
  await page.getByRole('gridcell', { name: 'ABCD' }).click();
  await page.getByRole('button', { name: 'Usuń' }).first().click(); 
  const dialog = page.getByRole('dialog', { name: 'Uwaga' });
  await dialog.getByText('Czy na pewno chcesz usunąć zlecenie?').waitFor();
  await dialog.getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(2000);
});


test('dysponentDokumentyZaangazowaniaUmowyWeryfikacja', async ({ page }) => {
  test.setTimeout(180000); 

  await login(page, UNIT_NAME);
  
  await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Zadania bieżące' }).click();
  
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('button.p-button:has-text("Zamknij")').click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('timesicon').first().click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.getByLabel('1').getByText('1').click();

  await page.locator('atomics-select-input:has(label:text("Rodzaj")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('atomics-select-input:has(label:text("Typ")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('label:text("Tytuł")').locator('..').locator('input[type="text"]').fill('ABC');
  await page.locator('label:text("Numer na umowie")').locator('..').locator('input[type="text"]').fill('1234');
  await page.locator('label:text("Numer własny")').locator('..').locator('input[type="text"]').fill('1111');

  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.locator('button.pb-btn-primary--new:has-text("Dodaj plan")').click();
  await page.locator('label:text("Klasyfikacja")').locator('..').locator('.p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.locator('p-inputnumber').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Przypisz kontrahenta do umowy' }).click();
  await page.waitForTimeout(1000);
  await page.locator('tr.dx-row.dx-data-row').last().locator('td[role="gridcell"]:nth-child(2)').click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Wybierz', { exact: true }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(2).click();
  
  await page.getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.waitForTimeout(2000);
  await page.locator('atomics-text-input:has(label:text("Nazwa załącznika")) input[type="text"]').fill('test');
  await page.locator('span:has-text("Wybierz plik") input[type="file"]').setInputFiles(ZALACZNIK);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('atomics-select-input:has(label:text("Rodzaj zabezpieczenia")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.getByRole('main').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(5000);
  
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Anuluj dokument' }).click();
  await page.locator('textarea[name="undefined"]').fill('a');
  await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  await page.getByRole('button', { name: 'Cofnij anulowanie' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('1').getByText('1').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
});


const FIELDS = [
  { label: "Rodzaj", type: "select", openSelector: 'atomics-select-input:has(label:text("Rodzaj")) .p-dropdown-trigger' },
  { label: "Typ", type: "select", openSelector: 'atomics-select-input:has(label:text("Typ")) .p-dropdown-trigger' },
  { label: "Tytuł", type: "text", selector: 'label:text("Tytuł")', value: 'ABC' },
  { label: "Numer na umowie", type: "text", selector: 'label:text("Numer na umowie")', value: '1234' },
  { label: "Numer własny", type: "text", selector: 'label:text("Numer własny")', value: '1111' },
  { label: "Data wpływu", type: "calendar", selector: 'span:has-text("Data wpływu") #calendar', value: '2025-07-30' },
];

FIELDS.forEach((emptyField) => {
  test(`Umowy puste pole: ${emptyField.label}`, async ({ page }) => {
	  
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await login(page, UNIT_NAME);

    await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
    await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
    await page.getByRole('link', { name: 'Umowy' }).click();
    await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
    await page.getByRole('button', { name: 'Dodaj' }).click();

    for (const field of FIELDS) {
      if (field.label === emptyField.label) {
        if (field.type === 'select') {
        }
        if (field.type === 'text') {
          await page.locator(field.selector).locator('..').locator('input[type="text"]').fill('');
        }
        if (field.type === 'calendar') {
          await page.locator('span').filter({ hasText: 'Data wpływu' }).locator('#calendar').click();
          await page.locator('span').filter({ hasText: 'Data wpływu' }).locator('#calendar').fill('');
        }
      } else {
        if (field.type === 'select') {
          await page.locator(field.openSelector).click();
          await page.getByRole('option').last().click();
        }
        if (field.type === 'text') {
          await page.locator(field.selector).locator('..').locator('input[type="text"]').fill(field.value);
        }
        if (field.type === 'calendar') {
          await page.locator('span').filter({ hasText: 'Data wpływu' }).locator('#calendar').click();
          await page.getByLabel('10').getByText('10').click();
        }
      }
    }

    await page.getByRole('button', { name: 'Zapisz' }).click();
	await page.waitForTimeout(2000);
	expect(consoleErrors.length, `Blad: ${consoleErrors.join('\n')}`).toBeGreaterThan(0);
	
    if (consoleErrors.length > 0) {
      console.log(`\n${consoleErrors.join('\n')}`);
    }
  });
});


const FIELDS2 = [
  { label: "Tytuł", type: "text", selector: 'label:text("Tytuł")', value: 'ABC' },
  { label: "Numer własny", type: "text", selector: 'label:text("Numer własny")', value: '1111' },
  { label: "Data zlecenia", type: "calendar", selector: 'span:has-text("Data zlecenia") #calendar' },
  { label: "Data realizacji", type: "calendar", selector: 'span:has-text("Data realizacji") #calendar' }
];

FIELDS2.forEach((emptyField) => {
  test(`Zlecenia puste pole: ${emptyField.label}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await login(page, UNIT_NAME);

    await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
    await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
    await page.getByRole('link', { name: 'Zlecenia' }).click();
    await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
    await page.getByRole('button', { name: 'Dodaj' }).click();

    for (const field of FIELDS2) {
      if (field.label === emptyField.label) {
        if (field.type === 'text') {
          await page.locator(field.selector).locator('..').locator('input[type="text"]').fill('');
        }
        if (field.type === 'calendar') {
          await page.locator(field.selector).click();
          await page.locator(field.selector).fill('');
        }
      } else {
        if (field.type === 'text') {
          await page.locator(field.selector).locator('..').locator('input[type="text"]').fill(field.value);
        }
      }
    }

    await page.getByRole('button', { name: 'Zapisz' }).click();
    await page.waitForTimeout(2000);

    expect(consoleErrors.length, `Błąd: ${consoleErrors.join('\n')}`).toBeGreaterThan(0);

    if (consoleErrors.length > 0) {
      console.log(`\n${consoleErrors.join('\n')}`);
    }
  });
});


test('dysponentDokumentyZaangazowaniaUmowyWeryfikacjaSkarbnika', async ({ page }) => {
  test.setTimeout(180000); 

  await login(page, UNIT_NAME);
  
  await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Zadania bieżące' }).click();
  
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('button.p-button:has-text("Zamknij")').click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('timesicon').first().click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.getByLabel('1').getByText('1').click();

  await page.locator('atomics-select-input:has(label:text("Rodzaj")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('atomics-select-input:has(label:text("Typ")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('label:text("Tytuł")').locator('..').locator('input[type="text"]').fill('ABC');
  await page.locator('label:text("Numer na umowie")').locator('..').locator('input[type="text"]').fill('1234');
  await page.locator('label:text("Numer własny")').locator('..').locator('input[type="text"]').fill('1111');

  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.locator('button.pb-btn-primary--new:has-text("Dodaj plan")').click();
  await page.locator('label:text("Klasyfikacja")').locator('..').locator('.p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.locator('p-inputnumber').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Przypisz kontrahenta do umowy' }).click();
  await page.waitForTimeout(1000);
  await page.locator('tr.dx-row.dx-data-row').last().locator('td[role="gridcell"]:nth-child(2)').click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Wybierz', { exact: true }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(2).click();
  
  await page.getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.waitForTimeout(2000);
  await page.locator('atomics-text-input:has(label:text("Nazwa załącznika")) input[type="text"]').fill('test');
  await page.locator('span:has-text("Wybierz plik") input[type="file"]').setInputFiles(ZALACZNIK);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('atomics-select-input:has(label:text("Rodzaj zabezpieczenia")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.getByRole('main').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(5000);
  
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Anuluj dokument' }).click();
  await page.locator('textarea[name="undefined"]').fill('a');
  await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  await page.getByRole('button', { name: 'Cofnij anulowanie' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('10').getByText('10').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByText(FINANCE_UNIT).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('button', { name: 'Weryfikacja wydziału' }).click();

  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('10').getByText('10').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByText(UNIT_NAME).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.getByRole('button', { name: 'Weryfikacja skarbnika' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('10').getByText('10').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).click();
  await page.getByRole('button', { name: 'Zwróć dokument' }).click();
  await page.locator('textarea').fill('aaa');
  await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  await page.getByRole('button', { name: 'Weryfikacja skarbnika' }).click();

  await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('button', { name: 'Usuń' }).first().click();
  const dialog2 = page.getByRole('dialog', { name: 'Uwaga' });
  await dialog2.getByText('Czy na pewno chcesz usunąć umowę?').waitFor();
  await dialog2.getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(2000);
});


test('dysponentDokumentyZaangazowaniaZleceniaWeryfikacjaSkarbnika', async ({ page }) => {
  test.setTimeout(180000); 

  await login(page, UNIT_NAME);
  
  await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Zlecenia' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();

  await page.locator('label:text("Tytuł")').locator('..').locator('input[type="text"]').fill('ABC');
  await page.locator('label:text("Numer własny")').locator('..').locator('input[type="text"]').fill('1111');

  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.locator('button.pb-btn-primary--new:has-text("Dodaj plan")').click();
  await page.locator('label:text("Klasyfikacja")').locator('..').locator('.p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Przypisz kontrahenta do umowy' }).click();
  await page.waitForTimeout(1000);
  await page.locator('tr.dx-row.dx-data-row').last().locator('td[role="gridcell"]:nth-child(2)').click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Wybierz', { exact: true }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(2).click();
  
  await page.getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.waitForTimeout(2000);
  await page.locator('atomics-text-input:has(label:text("Nazwa załącznika")) input[type="text"]').fill('test');
  await page.locator('span:has-text("Wybierz plik") input[type="file"]').setInputFiles(ZALACZNIK);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('atomics-select-input:has(label:text("Rodzaj zabezpieczenia")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.getByRole('main').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(2000);
   
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Anuluj dokument' }).click();
  await page.locator('textarea[name="undefined"]').fill('a');
  await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  await page.getByRole('button', { name: 'Cofnij anulowanie' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('1').getByText('1').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByText(FINANCE_UNIT).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('button', { name: 'Weryfikacja wydziału' }).click();

  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Zlecenia' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('gridcell', { name: 'ABC' }).click();
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('1').getByText('1').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByText(UNIT_NAME).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.getByRole('button', { name: 'Weryfikacja skarbnika' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Zlecenia' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('gridcell', { name: 'ABC' }).click();
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('1').getByText('1').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).click();
  await page.getByRole('button', { name: 'Zwróć dokument' }).click();
  await page.locator('textarea').fill('aaa');
  await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  await page.getByRole('button', { name: 'Weryfikacja skarbnika' }).click();
  
  await page.getByRole('gridcell', { name: 'ABC' }).click();
  await page.getByRole('button', { name: 'Usuń' }).first().click(); 
  const dialog = page.getByRole('dialog', { name: 'Uwaga' });
  await dialog.getByText('Czy na pewno chcesz usunąć zlecenie?').waitFor();
  await dialog.getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(2000);
});


test('dysponentDokumentyZaangazowaniaUmowyRejestr', async ({ page }) => {
  test.setTimeout(180000); 

  await login(page, UNIT_NAME);
  
  await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Zadania bieżące' }).click();
  
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('button.p-button:has-text("Zamknij")').click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('timesicon').first().click();
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.getByLabel('10').getByText('10').click();

  await page.locator('atomics-select-input:has(label:text("Rodzaj")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('atomics-select-input:has(label:text("Typ")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();

  await page.locator('label:text("Tytuł")').locator('..').locator('input[type="text"]').fill('ABC');
  await page.locator('label:text("Numer na umowie")').locator('..').locator('input[type="text"]').fill('1234');
  await page.locator('label:text("Numer własny")').locator('..').locator('input[type="text"]').fill('1111');

  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(3000);
  
  await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  await page.waitForTimeout(3000);
  await page.locator('button.pb-btn-primary--new:has-text("Dodaj plan")').click();
  await page.locator('label:text("Klasyfikacja")').locator('..').locator('.p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.locator('p-inputnumber').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Kontrahenci' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Przypisz kontrahenta do umowy' }).click();
  await page.waitForTimeout(1000);
  await page.locator('tr.dx-row.dx-data-row').last().locator('td[role="gridcell"]:nth-child(2)').click({ force: true });
  await page.waitForTimeout(1000);
  await page.getByText('Wybierz', { exact: true }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(2).click();
  
  await page.getByRole('tab', { name: ' Załączniki' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.waitForTimeout(2000);
  await page.locator('atomics-text-input:has(label:text("Nazwa załącznika")) input[type="text"]').fill('test');
  await page.locator('span:has-text("Wybierz plik") input[type="file"]').setInputFiles(ZALACZNIK);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('tab', { name: ' Zabezpieczenie' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  await page.locator('atomics-select-input:has(label:text("Rodzaj zabezpieczenia")) .p-dropdown-trigger').click();
  await page.getByRole('option').last().click();
  await page.getByRole('main').getByRole('spinbutton').click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  await page.waitForTimeout(2000);
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(5000);
  
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Anuluj dokument' }).click();
  await page.locator('textarea[name="undefined"]').fill('a');
  await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  await page.getByRole('button', { name: 'Cofnij anulowanie' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('1').getByText('1').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByText(FINANCE_UNIT).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('button', { name: 'Weryfikacja wydziału' }).click();

  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('1').getByText('1').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByText(UNIT_NAME).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await page.getByRole('button', { name: 'Weryfikacja skarbnika' }).click();
  await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  await page.getByRole('link', { name: 'Umowy' }).click();
  await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  await page.getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByLabel('1').getByText('1').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  await page.waitForTimeout(3000);

  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Przenieś do rejestru' }).click();
  await page.waitForTimeout(2000);
  await page.getByLabel('1').getByText('1').click();
  await page.waitForTimeout(3000);
  await page.getByRole('dialog').getByRole('button', { name: 'Przenieś do rejestru' }).click();
  await page.waitForTimeout(2000);
});


//sprawdzić jak zlecenia będą działać 

// test('dysponentDokumentyZaangazowaniaZleceniaRejestr', async ({ page }) => {
  // test.setTimeout(180000); 

  // await login(page, UNIT_NAME);
  
  // await page.getByRole('button', { name: 'Weryfikacja wydziałowa' }).click();
  // await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  // await page.getByRole('link', { name: 'Zlecenia' }).click();
  // await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  
  // await page.getByRole('button', { name: 'Dodaj' }).click();

  // await page.locator('label:text("Tytuł")').locator('..').locator('input[type="text"]').fill('ABC');
  // await page.locator('label:text("Numer własny")').locator('..').locator('input[type="text"]').fill('1111');

  // await page.waitForTimeout(1000);
  // await page.getByRole('button', { name: 'Zapisz' }).click();
  // await page.waitForTimeout(3000);
  
  // await page.getByRole('main').getByRole('tab', { name: ' Plan realizacji' }).click();
  // await page.waitForTimeout(3000);
  // await page.locator('button.pb-btn-primary--new:has-text("Dodaj plan")').click();
  // await page.locator('label:text("Klasyfikacja")').locator('..').locator('.p-dropdown-trigger').click();
  // await page.getByRole('option').last().click();
  // await page.getByRole('button', { name: 'Zapisz' }).click();
  
  // await page.getByRole('tab', { name: ' Kontrahenci' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('button', { name: 'Przypisz kontrahenta do umowy' }).click();
  // await page.waitForTimeout(1000);
  // await page.locator('tr.dx-row.dx-data-row').last().locator('td[role="gridcell"]:nth-child(2)').click({ force: true });
  // await page.waitForTimeout(1000);
  // await page.getByText('Wybierz', { exact: true }).click();
  // await page.getByRole('button', { name: 'Zamknij' }).nth(2).click();
  
  // await page.getByRole('tab', { name: ' Załączniki' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  // await page.waitForTimeout(2000);
  // await page.locator('atomics-text-input:has(label:text("Nazwa załącznika")) input[type="text"]').fill('test');
  // await page.locator('span:has-text("Wybierz plik") input[type="file"]').setInputFiles(ZALACZNIK);
  // await page.getByRole('button', { name: 'Zapisz' }).click();
  
  // await page.getByRole('tab', { name: ' Zabezpieczenie' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByRole('main').getByRole('button', { name: 'Dodaj' }).click();
  // await page.locator('atomics-select-input:has(label:text("Rodzaj zabezpieczenia")) .p-dropdown-trigger').click();
  // await page.getByRole('option').last().click();
  // await page.getByRole('main').getByRole('spinbutton').click();
  // await page.getByRole('button', { name: 'Zapisz' }).click();
  // await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  // await page.waitForTimeout(2000);
  // await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  // await page.waitForTimeout(2000);
   
  // await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  // await page.getByRole('button', { name: 'Anuluj dokument' }).click();
  // await page.locator('textarea[name="undefined"]').fill('a');
  // await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  // await page.getByRole('button', { name: 'Cofnij anulowanie' }).click();
  // await page.getByRole('button', { name: 'Weryfikuj' }).click();
  // await page.getByLabel('1').getByText('1').click();
  // await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  // await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  // await page.getByRole('button', { name: 'Kontekst' }).click();
  // await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  // await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  // await page.getByText(FINANCE_UNIT).click();
  // await page.getByRole('button', { name: 'Dalej' }).click();
  // await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  // await page.getByRole('button', { name: 'Zaloguj' }).click();
  // await page.getByRole('button', { name: 'Weryfikacja wydziału' }).click();

  // await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  // await page.getByRole('link', { name: 'Zlecenia' }).click();
  // await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  // await page.getByRole('gridcell', { name: 'ABC' }).click();
  // await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  // await page.getByRole('button', { name: 'Weryfikuj' }).click();
  // await page.getByLabel('1').getByText('1').click();
  // await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  // await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  
  // await page.getByRole('button', { name: 'Kontekst' }).click();
  // await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  // await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  // await page.getByText(UNIT_NAME).click();
  // await page.getByRole('button', { name: 'Dalej' }).click();
  // await page.getByLabel('Przesuń 1').locator('div').nth(1).click();
  // await page.getByRole('button', { name: 'Zaloguj' }).click();

  // await page.getByRole('button', { name: 'Weryfikacja skarbnika' }).click();
  // await page.getByRole('button', { name: 'Dokumenty zaangażowania' }).locator('a').click();
  // await page.getByRole('link', { name: 'Zlecenia' }).click();
  // await page.getByLabel('Zadania bieżące').getByRole('button').filter({ hasText: /^$/ }).click();
  // await page.getByRole('gridcell', { name: 'ABC' }).click();
  // await page.getByRole('tab', { name: ' Weryfikacja' }).click();
  // await page.getByRole('button', { name: 'Weryfikuj' }).click();
  // await page.getByLabel('1').getByText('1').click();
  // await page.getByRole('dialog').getByRole('button', { name: 'Weryfikuj' }).click();
  // await page.getByRole('button', { name: 'Zapisz weryfikację' }).click();
  // await page.waitForTimeout(3000);

  // await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  // await page.waitForTimeout(3000);
  // await page.getByRole('button', { name: 'Przenieś do rejestru' }).click();
  // await page.waitForTimeout(2000);
  // await page.getByLabel('1').getByText('1').click();
  // await page.waitForTimeout(3000);
  // await page.getByRole('dialog').getByRole('button', { name: 'Przenieś do rejestru' }).click();
  // await page.waitForTimeout(2000);
// });