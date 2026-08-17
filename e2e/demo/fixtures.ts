import { test as base, expect } from "@playwright/test";
import { LoginPage } from "./pages/login.page";
import { InventoryPage } from "./pages/inventory.page";
import { CartPage } from "./pages/cart.page";
import { CheckoutPage } from "./pages/checkout.page";

/**
 * Fixtures for the public demo suite.
 *
 * Credentials come from the environment with the published demo defaults, so
 * the suite runs out of the box and can still be pointed at another
 * environment without touching the code.
 */

export const users = {
  standard: process.env["DEMO_USER"] ?? "standard_user",
  locked: "locked_out_user",
  problem: "problem_user",
} as const;

export const password = process.env["DEMO_PASSWORD"] ?? "secret_sauce";

export const STORAGE_STATE = "playwright/.auth/demo-user.json";

type DemoFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<DemoFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect };
