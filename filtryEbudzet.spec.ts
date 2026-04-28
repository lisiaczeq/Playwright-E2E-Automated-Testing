import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';
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


async function selectDropdownByLabel(page, label: string, option: string) {
  const dropdown = page
    .locator(`span[aria-label="${label}"]`)
    .locator('xpath=..') 
    .locator('.p-dropdown-trigger');

  await expect(dropdown).toBeVisible({ timeout: 5000 });
  await dropdown.click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('PlanistaPlanBudzetuPlanBudzetu', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Plan Budżetu', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Rozchody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Wydatki');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  const publicFundingLabel = 'Dotacja finansowanie publiczne';
  const checkboxContainer = page.locator(`atomics-tristate-checkbox:has-text("${publicFundingLabel}")`);
  const box = checkboxContainer.locator('.p-checkbox-box');

  await expect(box).toBeVisible({ timeout: 5000 });

  const isChecked = await box.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await box.click();
  }

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});


test('PlanistaPlanBudzetuPlanBudzetuListaZmian', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Plan Budżetu - lista zmian', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Rozchody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Wydatki');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  const publicFundingLabel = 'Dotacja finansowanie publiczne';
  const checkboxContainer = page.locator(`atomics-tristate-checkbox:has-text("${publicFundingLabel}")`);
  const box = checkboxContainer.locator('.p-checkbox-box');

  await expect(box).toBeVisible({ timeout: 5000 });

  const isChecked = await box.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await box.click();
  }

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaPlanBudzetuPlanWedlugJednostek', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Plan według jednostek', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Rozchody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Wydatki');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  const publicFundingLabel = 'Dotacja finansowanie publiczne';
  const checkboxContainer = page.locator(`atomics-tristate-checkbox:has-text("${publicFundingLabel}")`);
  const box = checkboxContainer.locator('.p-checkbox-box');

  await expect(box).toBeVisible({ timeout: 5000 });

  const isChecked = await box.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await box.click();
  }

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaPlanBudzetuFunduszSolecki', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Fundusz sołecki', exact: true }).click();
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);

  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(2000);

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(2000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  const publicFundingLabel = 'Dotacja finansowanie publiczne';
  const checkboxContainer = page.locator(`atomics-tristate-checkbox:has-text("${publicFundingLabel}")`);
  const box = checkboxContainer.locator('.p-checkbox-box');

  await expect(box).toBeVisible({ timeout: 5000 });

  const isChecked = await box.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await box.click();
  }

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaPlanBudzetuFunduszOsiedlowy', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Fundusz osiedlowy', exact: true }).click();
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);

  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(2000);

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(2000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  const publicFundingLabel = 'Dotacja finansowanie publiczne';
  const checkboxContainer = page.locator(`atomics-tristate-checkbox:has-text("${publicFundingLabel}")`);
  const box = checkboxContainer.locator('.p-checkbox-box');

  await expect(box).toBeVisible({ timeout: 5000 });

  const isChecked = await box.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await box.click();
  }

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaPlanBudzetuPlanBudzetuPlanInwestycji', async ({ page }) => {
  test.setTimeout(120_000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Plan inwestycji', exact: true }).click();
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);

  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(2000);

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(2000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  const publicFundingLabel = 'Dotacja finansowanie publiczne';
  const checkboxContainer = page.locator(`atomics-tristate-checkbox:has-text("${publicFundingLabel}")`);
  const box = checkboxContainer.locator('.p-checkbox-box');

  await expect(box).toBeVisible({ timeout: 5000 });

  const isChecked = await box.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await box.click();
  }

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaPlanBudzetuZestawienieZmian', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Zestawienie zmian', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Otwarty');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Rozchody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Wydatki');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Otwarty', 'Dowolny');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaPlanBudzetuUdzieloneDotacje', async ({ page }) => {
  test.setTimeout(120000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Udzielone dotacje', exact: true }).click();
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);

  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(2000);

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(2000);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await checkAllVisibleTristateCheckboxes(page);
  await page.waitForTimeout(3000);
  
  const publicFundingLabel = 'Dotacja finansowanie publiczne';
  const checkboxContainer = page.locator(`atomics-tristate-checkbox:has-text("${publicFundingLabel}")`);
  const box = checkboxContainer.locator('.p-checkbox-box');

  await expect(box).toBeVisible({ timeout: 5000 });

  const isChecked = await box.getAttribute('aria-checked');
  if (isChecked !== 'true') {
    await box.click();
  }

  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaPlanBudzetuAutopoprawki', async ({ page }) => {
  test.setTimeout(300000); 

  await login(page);

  await page.getByRole('button', { name: 'Plan budżetu' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Autopoprawki', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Rozchody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Wydatki');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaZestawieniaZestawienieWedlugGrup', async ({ page }) => {
  test.setTimeout(300000); 

  await login(page);

  await page.getByRole('button', { name: 'Zestawienia' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Zestawienie według grup', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Dochody', 'Wydatki');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);
    
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
    
  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await page.waitForSelector('p-multiselect');

  await selectLastOptionInEachMultiselect(page);
  await page.waitForTimeout(5000);
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaZestawieniaZestawienieDochodowIWydatkow', async ({ page }) => {
  test.setTimeout(300000); 

  await login(page);

  await page.getByRole('button', { name: 'Zestawienia' }).locator('a').click();
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Zestawienie Dochodów i Wydatków', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zagregowany', 'Zatwierdzony');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Zatwierdzony', 'Dowolny');
  await page.waitForTimeout(2000);
  
  console.log('========================================================================');
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button.p-dialog-header-close').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  await Promise.all((await page.locator('button:has-text("Zamknij")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));  
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  
  await Promise.all((await page.locator('button:has-text("Resetuj filtr")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  
  await page.getByRole('button', { name: 'Filtr', exact: true }).click();
  await page.waitForTimeout(3000);
  
  
  await Promise.all((await page.locator('button:has-text("Filtruj")').all()).map(btn => btn.isVisible().then(v => v && btn.click())));
  await page.waitForTimeout(2000);
});

test('PlanistaKlasyfikacjaBudzetowa', async ({ page }) => {
  test.setTimeout(300000); 

  await login(page);
  
  console.log('========================================================================');
  await page.getByRole('link', { name: 'Klasyfikacja budżetowa', exact: true }).click();
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Pochodzenie', 'Dział');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Dział', 'Rozdział');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Rozdział', 'Paragraf');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Paragraf', 'Finansowanie');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Finansowanie', 'Ewidencja');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Ewidencja', 'Kategorie wydatków');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Kategorie wydatków', 'Źródło finansowania');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Wydatki', 'Dochody');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Dochody', 'Przychody');
  await page.waitForTimeout(2000);
  
  await selectDropdownByLabel(page, 'Przychody', 'Rozchody');
  await page.waitForTimeout(2000);
  
});