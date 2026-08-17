import { test, expect } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("home page, signed out", () => {
  test(
    "home page shows the Grocerly heading",
    { tag: ["@smoke"] },
    async ({ homePage }) => {
      await expect(homePage.heading).toBeVisible();
    },
  );

  test(
    "shows the primary calls to action",
    { tag: ["@smoke"] },
    async ({ homePage }) => {
      await expect(homePage.browseCategoriesButton).toBeVisible();
      await expect(homePage.searchProductsButton).toBeVisible();
    },
  );

  test(
    "click on Browse categories leads to the categories page",
    { tag: ["@regression"] },
    async ({ homePage, page }) => {
      await homePage.openCategories();
      await expect(page).toHaveURL(/categories/);
    },
  );

  test(
    "shows Sign in and Sign up for a guest",
    { tag: ["@regression"] },
    async ({ navbar }) => {
      await expect(navbar.signInButton).toBeVisible();
      await expect(navbar.signUpButton).toBeVisible();
    },
  );

  test(
    "hides guarded navigation items from a guest",
    { tag: ["@regression", "@security"] },
    async ({ navbar }) => {
      await expect(navbar.myOrdersLink).toHaveCount(0);
      await expect(navbar.membershipLink).toHaveCount(0);
      await expect(navbar.adminLink).toHaveCount(0);
    },
  );

  test(
    "toggling the theme switch enables dark mode and persists the choice",
    { tag: ["@regression"] },
    async ({ navbar, page }) => {
      await navbar.toggleTheme();

      await expect(page.locator("html")).toHaveClass("app-dark");
      const theme = await page.evaluate(() =>
        localStorage.getItem("grocerly-theme"),
      );
      expect(theme).toBe("dark");
    },
  );
});
