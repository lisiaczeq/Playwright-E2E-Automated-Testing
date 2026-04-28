import { test, expect } from '@playwright/test';

const BASE_URL = 'https://test.com';
const USERNAME = 'username';
const PASSWORD = 'password';

async function login(page) {
  await page.goto(BASE_URL);
  await page.getByRole('textbox', { name: 'Login' }).fill(USERNAME);
  await page.getByRole('textbox', { name: 'Hasło' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

test('PlanistaUzytkownicy', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);
  await page.waitForTimeout(1000);
  
  await page.getByRole('link', { name: 'Użytkownicy' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Dodaj' }).click();
  await page.waitForTimeout(500);
  
  await page.getByText('Login', { exact: true }).locator('xpath=../input').fill('zbigniewz');
  await page.locator('input[type="password"]').fill('zbigniewz');
  await page.getByText('Imię', { exact: true }).locator('xpath=../input').fill('Zbigniew');
  await page.getByText('Nazwisko', { exact: true }).locator('xpath=../input').fill('Zając');
  await page.locator('p-checkbox div').nth(2).click();
  
  await page.getByRole('tab', { name: 'Uprawnienia' }).click();
  await page.waitForTimeout(500);
  
  await page.getByRole('row', { name: 'Wybierz wiersz Dokumenty' }).getByLabel('Wybierz wiersz').click();
  
  await page.getByRole('row', { name: 'Wybierz wiersz Zmiany' }).getByLabel('Wybierz wiersz').click();
  
  await page.getByRole('row', { name: /Zatwierdzenie przez osobę z wydziału zamówień publicznych/ }).getByLabel('Wybierz wiersz').click();
  await page.getByRole('row', { name: /Zatwierdzenie przez głównego księgowego/ }).getByLabel('Wybierz wiersz').click();
  
  await page.getByRole('button', { name: 'Zmień' }).click();
  await page.waitForTimeout(1000);
  
  await page.locator('p-footer:has-text("Odczyt")').click();
  
  await page.getByRole('row', { name: /Zatwierdzenie przez dyrektora/ }).getByLabel('Wybierz wiersz').click();
  await page.getByRole('row', { name: /Zatwierdzenie przez głównego księgowego/ }).getByLabel('Wybierz wiersz').click();
  await page.getByRole('row', { name: /Zatwierdzenie przez osobę z wydziału zamówień/ }).getByLabel('Wybierz wiersz').click();
  await page.getByRole('row', { name: 'Wybierz wiersz Zmiany' }).getByLabel('Wybierz wiersz').click();
  
  await page.getByRole('button', { name: 'Zmień' }).click();
  await page.waitForTimeout(1000);
  
  await page.locator('p-footer:has-text("Brak")').click();
  
  await page.getByRole('tab', { name: 'Jednostki' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('row', { name: 'Wybierz wiersz Urząd Stanu' }).getByLabel('Wybierz wiersz').click();
  await page.waitForTimeout(1000);
  
  await page.locator('button.p-element.theme_success.p-button:has(i.pi-check)').click();
  await page.waitForTimeout(2000);
  
  await page.locator('div.dx-pages > div.dx-page-indexes > div.dx-navigate-button.dx-next-button[tabindex="0"]').click();
  await page.waitForTimeout(1000);
  
  try {
    await page.getByRole('gridcell', { name: 'ZBIGNIEWZ', exact: true }).click();
  } catch (e) {
    console.log('Nie można znaleźć użytkownika na pierwszej stronie, próbuję przejść do następnej');
    try {
      await page.getByRole('group', { name: 'Tabela danych zawierająca' }).getByLabel('Następna strona').click();
      await page.waitForTimeout(1000);
      await page.getByRole('gridcell', { name: 'ZBIGNIEWZ', exact: true }).click();
    } catch (e2) {
      console.log('Użytkownik nie został znaleziony. Używam wyszukiwarki');
    }
  }
  
  await page.getByRole('button', { name: 'Edytuj dane' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('tab', { name: 'Uprawnienia' }).click();
  await page.getByRole('row', { name: 'Wybierz wiersz Dokumenty' }).getByLabel('Wybierz wiersz').click();
  await page.getByRole('button', { name: 'Zmień' }).click();
  await page.waitForTimeout(1000);
  
  await page.locator('p-footer:has-text("Odczyt")').click();
  
  await page.getByRole('tab', { name: 'Jednostki' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('row', { name: 'Wybierz wiersz UMUSC - Urząd' }).getByLabel('Wybierz wiersz').click();
  await page.waitForTimeout(500);
  
  await page.getByRole('row', { name: /Wydział Spraw Obywatelskich/ }).getByLabel('Wybierz wiersz').click();
  await page.waitForTimeout(500);
  
  await page.locator('button.p-element.theme_success.p-button:has(i.pi-check)').click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Reset hasła' }).click();
  await page.waitForTimeout(500);
  await page.getByText('Nowe hasło', { exact: true }).locator('xpath=../input').fill('zbigniewz');
  await page.getByText('Powtórz hasło', { exact: true }).locator('xpath=../input').fill('zbigniewz');
  
  await page.locator('button.p-element.theme_success.p-button:has(i.pi-check)').click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Usuń użytkownika' }).click();
  await page.getByRole('button', { name: 'Usuń', exact: true }).click();
});