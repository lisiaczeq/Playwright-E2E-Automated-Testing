import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';
const UNIT_NAME = 'unit';
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
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}


test('estate fund', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);
  
  await page.getByRole('link', { name: 'Słowniki' }).click();
  
  await page.getByRole('tab', { name: ' Fundusz osiedlowy' }).click();
  await page.getByText('Osiedla', { exact: true }).click();
  
  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.getByRole('dialog').locator('input[type="text"]').click();
  await page.getByRole('dialog').locator('input[type="text"]').fill('01');
  await page.locator('span').filter({ hasText: 'Nazwa' }).locator('#undefined').click();
  await page.locator('span').filter({ hasText: 'Nazwa' }).locator('#undefined').fill('Parcele I');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(500);
  await page.locator('div.dx-accordion-item-title').filter({ hasText: 'Osiedla', exact: true }).first().click();
  await page.getByText('Przedsięwzięcia - osiedla').click();
  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.getByRole('dialog').locator('input[type="text"]').click();
  await page.getByRole('dialog').locator('input[type="text"]').fill('01');
  await page.locator('label', { hasText: 'Nazwa' }).locator('..').locator('textarea').fill('Budowa i modernizacja infrastruktury osiedlowej');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByRole('option', { name: UNIT_NAME }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await page.getByRole('link', { name: 'Twoje zadania' }).click();
  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.getByRole('dialog').locator('input[type="text"]').click();
  await page.getByRole('dialog').locator('input[type="text"]').fill('10');
  await page.locator('textarea').click();
  await page.locator('textarea').fill('Zagospodarowanie przestrzeni publicznej');
  await page.locator('atomics-checkbox').filter({ hasText: 'Fundusz osiedlowy' }).locator('div').nth(2).click();
  const domyslneSolecwoDropdown = page.locator('atomics-select-with-description', {
    has: page.locator('label', { hasText: 'Domyślne osiedle' })
  });
  await domyslneSolecwoDropdown.getByRole('button', { name: 'dropdown trigger' }).click();
  await page.locator('li[role="option"]', { hasText: '01' }).click(); 
  const przedsiewziecieDropdown = page.locator('atomics-select-with-description', {
    has: page.locator('label', { hasText: 'Przedsięwzięcie osiedlowe' })
  });
  await przedsiewziecieDropdown.getByRole('button', { name: 'dropdown trigger' }).click();
  await page.locator('li[role="option"]', { hasText: '01' }).click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('button', { name: 'Projektowanie' }).locator('a').click();
  await page.getByRole('link', { name: 'Dokumenty planistyczne' }).click();
  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.locator('input[name="undefined"]').click();
  await page.locator('input[name="undefined"]').fill('Inwestycja osiedlowa');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('button', { name: 'Widok planu' }).click();
  await page.getByRole('button', { name: 'Nowa zmiana' }).click();

  async function selectDropdownByLabelExact(labelText: string, optionName: string) {
    const label = page.locator('label').filter({ hasText: labelText, exact: true }).first();
    const dropdown = label.locator('..').locator('p-dropdown').first();
    await dropdown.getByRole('button', { name: 'dropdown trigger', exact: true }).click();
    const option = page.locator('li[role="option"]', { hasText: optionName }).filter({ hasText: optionName }).first();
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  await page.getByRole('button', { name: '+ Nowy' }).click();

  await selectDropdownByLabelExact('Rozdział', '70019');
  await selectDropdownByLabelExact('Paragraf', '427');
  await selectDropdownByLabelExact('Finansowanie', '6');
  await selectDropdownByLabelExact('Kategorie wydatków', '10');
  await selectDropdownByLabelExact('Źródło finansowania', '00');
  await selectDropdownByLabelExact('Pochodzenie', 'P');
  
  await page.locator('span').filter({ hasText: 'Zwiększenie' }).getByRole('spinbutton').click();
  await page.locator('span', { hasText: 'Zwiększenie' }).getByRole('spinbutton').fill('8000');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Zamknij' }).nth(0).click();
  
  await page.getByRole('button', { name: 'Zmiana statusu' }).click();
  await page.getByRole('button', { name: 'Zatwierdź i wyślij do' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await page.getByRole('button', { name: 'Przejdź do dokumentów' }).click();
  await page.getByRole('button', { name: 'Zmiana statusu' }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  
  await page.getByRole('button', { name: 'Projektowanie' }).locator('a').click();
  await page.getByRole('link', { name: 'Uchwały i zarządzenia' }).click();
  
  await page.getByRole('button', { name: 'Dodaj', exact: true }).click();
  await page.locator('p-dropdown').filter({ hasText: 'Wybierz z listy' }).getByLabel('dropdown trigger').click();
  await page.getByRole('option', { name: 'Uchwała zmieniająca budżet' }).click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('button', { name: 'Dodaj dokumenty' }).click();
  await page.getByRole('checkbox', { name: 'Wybierz wiersz' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Dodaj' }).click();
  
  await page.getByRole('checkbox', { name: 'Wybierz wszystkie' }).click();
  await page.getByRole('link', { name: 'Uchwały i zarządzenia' }).click();
  
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await page.getByLabel('Zatwierdź uchwałę').getByRole('button', { name: 'Zatwierdź' }).click();
  
  await page.getByRole('button', { name: 'Cofnij zatwierdzenie' }).click();
  await page.getByLabel('Cofnij uchwałę').getByRole('button', { name: 'Cofnij zatwierdzenie' }).click();
  
  //await page.getByRole('checkbox', { name: 'Wybierz wszystkie' }).click();
  await page.getByRole('button', { name: 'Odłącz' }).click();
  await page.getByRole('button', { name: 'Odepnij' }).click();
  
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń uchwałę').getByRole('button', { name: 'Usuń' }).click();
  
  await page.getByRole('link', { name: 'Dokumenty planistyczne' }).click();
  await page.getByRole('gridcell', { name: 'Inwestycja osiedlowa' }).click();
  
  await page.getByRole('button', { name: 'Zmiana statusu' }).click();
  await page.getByRole('button', { name: 'Cofnij zatwierdzenie' }).click();
  
  await page.getByRole('button', { name: 'Zmiana statusu' }).click();
  await page.getByRole('button', { name: 'Zwróć do jednostki' }).click();
  await page.getByRole('button', { name: 'Zwróć', exact: true }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  
  await page.locator('atomics-select-with-description').getByRole('button', { name: 'dropdown trigger' }).click();
  await page.getByRole('option', { name: UNIT_NAME }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await page.getByRole('button', { name: 'Przejdź do dokumentów' }).click();
  await page.locator('app-planning-documents').getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń dokument planistyczny').getByRole('button', { name: 'Usuń' }).click();
  
  await page.getByRole('link', { name: 'Twoje zadania' }).click();
  await page.getByRole('gridcell', { name: 'Zagospodarowanie przestrzeni publicznej' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await page.getByRole('link', { name: 'Słowniki' }).click();
  
  await page.getByText('Kategorie wydatków').click();
  await page.getByRole('gridcell', { name: 'Zagospodarowanie przestrzeni publicznej' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  await page.getByText('Kategorie wydatków').click();
  
  await page.getByRole('tab', { name: ' Fundusz osiedlowy' }).click();
  
  await page.locator('div.dx-accordion-item-title').filter({ hasText: 'Osiedla', exact: true }).first().click();
  await page.getByRole('gridcell', { name: 'Parcele I' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  await page.locator('div.dx-accordion-item-title').filter({ hasText: 'Osiedla', exact: true }).first().click();
  
  await page.getByText('Przedsięwzięcia - osiedla').click();
  await page.getByRole('gridcell', { name: 'Budowa i modernizacja' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(500);
});