import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/login.page";
import { InventoryPage } from "./pages/inventory.page";
import { STORAGE_STATE, users, password } from "./fixtures";

/**
 * Signs in once and stores the authenticated browser state on disk. Every
 * project that depends on `demo-setup` reuses that state instead of driving the
 * login form again, which keeps the suite fast and removes login as a shared
 * point of failure for unrelated tests.
 */
setup("authenticate as the standard user", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(users.standard, password);
  await inventoryPage.expectLoaded();

  await page.context().storageState({ path: STORAGE_STATE });
  await expect(inventoryPage.title).toHaveText("Products");
});
