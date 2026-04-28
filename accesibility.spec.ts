import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = 'http://127.0.0.1';
const USERNAME = 'username';
const PASSWORD = 'password';

async function login(page) {
  await page.goto(BASE_URL);
  await page.fill('input[type="text"]', USERNAME);
  await page.fill('input[type="password"]', PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

test('WCAG A or AA violations', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  const tabsToTest = [
    { label: 'Kalendarz', type: 'link' },
    { label: 'O mnie', type: 'button' },
    { label: 'Dane osobowe i dokumenty', type: 'link' },
    { label: 'Obowiązek obrony', type: 'link' },
    { label: 'Stopień niepełnosprawności', type: 'link' },
    { label: 'Moje zatrudnienie', type: 'button' },
    { label: 'Umowa o pracę', type: 'link' },
    { label: 'Badania lekarskie', type: 'link' },
    { label: 'Szkolenia BHP', type: 'link' },
    { label: 'Szkolenia', type: 'link' },
    { label: 'Poprzednie zatrudnienie', type: 'link' },
    { label: 'Mój czas pracy', type: 'button' },
    { label: 'Kalendarz pracy', type: 'link' },
    { label: 'Nieobecności', type: 'link' },
    { label: 'Mój staż pracy', type: 'link' },
    { label: 'Mój urlop', type: 'button' },
    { label: 'Informacje o urlopie', type: 'link' },
    { label: 'Zestawienie urlopowe', type: 'link' },
    { label: 'Wnioski urlopowe', type: 'link' },
    { label: 'Moje wykształcenie', type: 'button' },
    { label: 'Wykształcenie', type: 'link' },
    { label: 'Języki obce', type: 'link' },
    { label: 'Kwalifikacje dodatkowe', type: 'link' },
    { label: 'Pożyczki', type: 'link' },
    { label: 'Moja rodzina', type: 'link' },
    { label: 'Dokumenty elektr.', type: 'link' },
    { label: 'Inne wnioski', type: 'button' },
    { label: 'Wnioski wysłane', type: 'link' },
    { label: 'Wnioski otrzymane', type: 'link' },
    { label: 'Ustawienia konta', type: 'link' },
  ];

  const allViolations = [];

  for (const tab of tabsToTest) {
    if (tab.type === 'link') {
      await page.getByRole('link', { name: tab.label, exact: true }).click();
    } else {
      await page.getByRole('button', { name: tab.label, exact: true }).locator('a').click();
    }
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      allViolations.push({ tab: tab.label, violations: results.violations });
    }
  }

  if (allViolations.length > 0) {
    for (const violationSet of allViolations) {
      console.log(`Violations in "${violationSet.tab}":`);
      violationSet.violations.forEach(v => {
        console.log(`Rule: ${v.id}`);
        console.log(`Description: ${v.description}`);
		console.log(`Help: ${v.help}`);
        console.log(`Nodes affected: ${v.nodes.length}`);
		v.nodes.forEach((node, index) => {
          console.log(`Node #${index + 1}`);
          console.log(`Target: ${node.target.join(', ')}`);
          console.log(`HTML: ${node.html}`);
          console.log(`Failure Summary: ${node.failureSummary}`);
		});

		
      });
    }
  }

});
