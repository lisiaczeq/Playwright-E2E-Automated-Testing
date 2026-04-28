import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';
const USERNAME = 'username';
const PASSWORD = 'password';

async function login(page) {await page.goto(BASE_URL);
  await page.fill('input[type="text"]', USERNAME);
  await page.fill('input[type="password"]', PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

test('session cookie after login', async ({ page, context }) => {
  await login(page);
  await page.waitForURL('**/start', { timeout: 10000 });

  await page.waitForTimeout(3000);

  const cookies = await context.cookies();

  const userToken = cookies.find(c => c.name === 'userToken');
  const contextToken = cookies.find(c => c.name === 'contextToken');
  
  expect(userToken).toBeDefined();
  expect(contextToken).toBeDefined();
  
  expect(userToken?.value).toMatch(/^ey/);
  expect(userToken?.sameSite).toBe('Lax');
});

test('removing cookies after logout', async ({ page, context }) => {
  await login(page);
  await page.waitForURL('**/start', { timeout: 10000 });

  await page.waitForTimeout(3000);

  let cookies = await context.cookies();
  expect(cookies.find(c => c.name === 'userToken')).toBeDefined();
  expect(cookies.find(c => c.name === 'contextToken')).toBeDefined();

  await page.getByRole('button', { name: 'Wyloguj się' }).click();
  await page.waitForTimeout(1000);   

  cookies = await context.cookies();
  const userToken = cookies.find(c => c.name === 'userToken');
  const contextToken = cookies.find(c => c.name === 'contextToken');

  expect(userToken).toBeUndefined();
  expect(contextToken).toBeUndefined();
});