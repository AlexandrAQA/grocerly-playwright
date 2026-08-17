import { test, expect } from "./fixtures";

/**
 * Visual regression baselines are rendered per operating system, so they are
 * generated locally (or inside the Playwright Docker image) and this spec is
 * excluded from the CI run with `--grep-invert @visual`. See README.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test(
  "login page matches the visual baseline",
  { tag: ["@visual"] },
  async ({ loginPage, page }) => {
    await loginPage.goto();

    await expect(page).toHaveScreenshot("login-page.png", {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    });
  },
);
