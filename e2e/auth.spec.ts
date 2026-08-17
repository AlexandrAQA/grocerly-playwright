import { test, expect } from "./fixtures";

test.describe("authentication and route guards", () => {
  test(
    "a guest visiting the dashboard is redirected to sign-in",
    { tag: ["@smoke", "@security"] },
    async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/sign-in/);
    },
  );

  test(
    "sign-in page renders the authentication form",
    { tag: ["@regression"] },
    async ({ authPage, page }) => {
      await page.goto("/sign-in");
      await expect(authPage.authHost).toBeAttached();
    },
  );

  test(
    "sign-up page renders the registration form",
    { tag: ["@regression"] },
    async ({ authPage, page }) => {
      await page.goto("/sign-up");
      await expect(authPage.authHost).toBeAttached();
    },
  );
});
