import { test, expect } from '@playwright/test';
import { clerk, setupClerkTestingToken } from '@clerk/testing/playwright';

const hasAuthEnv = Boolean(process.env['CLERK_SECRET_KEY'] && process.env['TEST_USER_EMAIL']);

test.beforeEach(() => {
  test.skip(!hasAuthEnv, 'Authenticated tests require Clerk credentials (see README).');
});

test('signed-in user can access dashboard', async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto('/sign-in');

  await clerk.signIn({
    page,
    emailAddress: process.env['TEST_USER_EMAIL']!,
  });

  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
});

test('dashboard shows the signed-in user content', async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto('/sign-in');

  await clerk.signIn({
    page,
    emailAddress: process.env['TEST_USER_EMAIL']!,
  });

  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Convex session active')).toBeVisible();
});
