import { test as base, expect } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { HomePage } from "./pages/home.page";
import { NavbarPage } from "./pages/navbar.page";
import { AuthPage } from "./pages/auth.page";

/**
 * Fixtures for the Grocerly app suite.
 *
 * Page objects are injected into the specs instead of being constructed by
 * hand, so a spec declares only what it needs and never repeats setup code.
 *
 * `signedInPage` performs a token-based Clerk sign-in (no UI, no MFA) and is
 * skipped automatically when Clerk credentials are not configured, which keeps
 * the public-page tests runnable without any secrets.
 */

export const hasClerkCredentials = Boolean(
  process.env["CLERK_SECRET_KEY"] && process.env["TEST_USER_EMAIL"],
);

type AppFixtures = {
  homePage: HomePage;
  navbar: NavbarPage;
  authPage: AuthPage;
  signedInPage: HomePage["page"];
};

export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new NavbarPage(page));
  },
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  signedInPage: async ({ page }, use) => {
    test.skip(
      !hasClerkCredentials,
      "Authenticated tests require Clerk credentials (see README).",
    );

    await setupClerkTestingToken({ page });
    await page.goto("/sign-in");
    await clerk.signIn({
      page,
      emailAddress: process.env["TEST_USER_EMAIL"] as string,
    });

    await use(page);
  },
});

export { expect };
