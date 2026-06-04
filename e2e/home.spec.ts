import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home.page';
import { NavbarPage } from './pages/navbar.page';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('home page shows the Grocerly heading', async ({ page }) => {
  const home = new HomePage(page);
  await expect(home.heading).toBeVisible();
});

test('shows the Browse categories button', async ({ page }) => {
  const home = new HomePage(page);
  await expect(home.browseCategoriesButton).toBeVisible();
});

test('shows the Search products button', async ({ page }) => {
  const home = new HomePage(page);
  await expect(home.searchProductsButton).toBeVisible();
});

test('click on Browse categories leads to categories page', async ({ page }) => {
  const home = new HomePage(page);
  await home.openCategories();
  await expect(page).toHaveURL(/categories/);
});

test('shows Sign in and Sign Up buttons without authentication', async ({ page }) => {
  const navbar = new NavbarPage(page);
  await expect(navbar.signInButton).toBeVisible();
  await expect(navbar.signUpButton).toBeVisible();
});

test('shows absence of: My Orders, Membership, Admin', async ({ page }) => {
  const navbar = new NavbarPage(page);
  await expect(navbar.myOrdersLink).toHaveCount(0);
  await expect(navbar.membershipLink).toHaveCount(0);
  await expect(navbar.adminLink).toHaveCount(0);
});

test('toggling the theme switch enables dark mode', async ({ page }) => {
  const navbar = new NavbarPage(page);
  await navbar.toggleTheme();

  await expect(page.locator('html')).toHaveClass('app-dark');
  const theme = await page.evaluate(() => localStorage.getItem('grocerly-theme'));
  expect(theme).toBe('dark');
});
