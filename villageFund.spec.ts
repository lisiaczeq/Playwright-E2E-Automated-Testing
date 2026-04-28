import { test, expect } from '@playwright/test';

const BASE_URL = 'https://test.com';
const UNIT_NAME = 'xyz';
const USERNAME = 'passworld';
const PASSWORD = 'passworld';

test.beforeEach(async ({ page }) => {
  page.on('request', request => {
    console.log(`[REQUEST] ${request.method()} ${request.url()}`);
  });

  page.on('response', async response => {
    const request = response.request();
    console.log(`[RESPONSE] ${response.status()} ${request.method()} ${response.url()}`);
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

test('village fund', async ({ page }) => {
  test.setTimeout(150000);

  await login(page);
  
  await page.getByRole('link', { name: 'Słowniki' }).click();
  
  await page.getByRole('tab', { name: ' Fundusz sołecki' }).click();
  await page.getByText('Przedsięwzięcia - fundusz soł').click();
  
  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.getByRole('dialog').locator('input[type="text"]').click();
  await page.getByRole('dialog').locator('input[type="text"]').fill('01');
  await page.locator('span').filter({ hasText: 'Nazwa' }).locator('#undefined').click();
  await page.locator('span').filter({ hasText: 'Nazwa' }).locator('#undefined').fill('Renowacja przedszkola');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.waitForTimeout(500);
  await page.locator('div.dx-accordion-item-title', { hasText: 'Przedsięwzięcia - fundusz sołecki' }).click();
  await page.getByText('Sołectwa').click();
  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.getByRole('dialog').locator('input[type="text"]').click();
  await page.getByRole('dialog').locator('input[type="text"]').fill('01');
  await page.locator('textarea').click();
  await page.locator('textarea').fill('Sołectwo Rogóźno');
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
  await page.locator('textarea').fill('Inwestycje w strukturę oświatową ');
  await page.locator('atomics-checkbox').filter({ hasText: 'Fundusz sołecki' }).locator('div').nth(2).click();
  const domyslneSolecwoDropdown = page.locator('atomics-select-with-description', {
    has: page.locator('label', { hasText: 'Domyślne sołectwo' })
  });
  await domyslneSolecwoDropdown.getByRole('button', { name: 'dropdown trigger' }).click();
  await page.locator('li[role="option"]', { hasText: '01' }).click(); 
  const przedsiewziecieDropdown = page.locator('atomics-select-with-description', {
    has: page.locator('label', { hasText: 'Przedsięwzięcie sołeckie' })
  });
  await przedsiewziecieDropdown.getByRole('button', { name: 'dropdown trigger' }).click();
  await page.locator('li[role="option"]', { hasText: '01' }).click();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  
  await page.getByRole('button', { name: 'Projektowanie' }).locator('a').click();
  await page.getByRole('link', { name: 'Dokumenty planistyczne' }).click();
  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.locator('input[name="undefined"]').click();
  await page.locator('input[name="undefined"]').fill('Modernizacja infrastruktury edukacyjnej');
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

  await selectDropdownByLabelExact('Rozdział', '80104');
  await selectDropdownByLabelExact('Paragraf', '427');
  await selectDropdownByLabelExact('Finansowanie', '5');
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
  
  await page.getByRole('gridcell', { name: 'Modernizacja infrastruktury' }).click();
  await page.getByRole('link', { name: 'Uchwały i zarządzenia' }).click();
  
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await page.getByLabel('Zatwierdź uchwałę').getByRole('button', { name: 'Zatwierdź' }).click();
  
  await page.getByRole('button', { name: 'Cofnij zatwierdzenie' }).click();
  await page.getByLabel('Cofnij uchwałę').getByRole('button', { name: 'Cofnij zatwierdzenie' }).click();
  
  await page.getByRole('checkbox', { name: 'Wybierz wszystkie' }).click();
  await page.getByRole('button', { name: 'Odłącz' }).click();
  await page.getByRole('button', { name: 'Odepnij' }).click();
  
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń uchwałę').getByRole('button', { name: 'Usuń' }).click();
  
  await page.getByRole('link', { name: 'Dokumenty planistyczne' }).click();
  await page.getByRole('gridcell', { name: 'Modernizacja infrastruktury' }).click();
  
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
  await page.getByRole('gridcell', { name: 'Inwestycje w strukturę oś' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  
  await page.getByRole('button', { name: 'Kontekst' }).click();
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  
  await page.getByRole('link', { name: 'Słowniki' }).click();
  
  await page.getByText('Kategorie wydatków').click();
  await page.getByRole('gridcell', { name: 'Inwestycje w strukturę oś' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  await page.getByText('Kategorie wydatków').click();
  
  await page.getByRole('tab', { name: ' Fundusz sołecki' }).click();
  
  await page.getByText('Przedsięwzięcia - fundusz soł').click();
  await page.getByRole('gridcell', { name: 'Renowacja przedszkola' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  
  await page.getByText('Przedsięwzięcia - fundusz soł').click();
  await page.getByText('Sołectwa').click();
  await page.getByRole('gridcell', { name: 'Sołectwo Rogóźno' }).click();
  await page.getByRole('button', { name: 'Usuń' }).click();
  await page.getByLabel('Usuń element').getByRole('button', { name: 'Usuń' }).click();
  await page.waitForTimeout(500);
});