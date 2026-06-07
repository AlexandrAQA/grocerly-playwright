import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';


test('click on dashboard item leads to signIn page', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/sign-in/);
})

test('Sign-in page shows the authentication form', async ({ page }) => {
    const authPage = new AuthPage(page);
    await page.goto('/sign-in');
    await expect(authPage.authHost).toBeAttached();
})

test('Sign-Up page shows the registration form', async ({ page }) => {
    const authPage = new AuthPage(page);
    await page.goto('/sign-up');
    await expect(authPage.authHost).toBeAttached();
})