import { test, expect, STORAGE_STATE } from "./fixtures";

test.use({ storageState: STORAGE_STATE });

test.describe("product catalogue", () => {
  test(
    "catalogue shows all products for a signed-in user",
    { tag: ["@smoke"] },
    async ({ inventoryPage }) => {
      await inventoryPage.goto();

      await expect(inventoryPage.items).toHaveCount(6);
      await inventoryPage.expectCartCount(0);
    },
  );

  test(
    "sorting by price returns products in ascending order",
    { tag: ["@regression"] },
    async ({ inventoryPage }) => {
      await inventoryPage.goto();
      await inventoryPage.sortBy("Price (low to high)");

      const names = await inventoryPage.productNames();
      const prices: number[] = [];
      for (const name of names) {
        prices.push(await inventoryPage.priceOf(name));
      }

      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    },
  );

  test(
    "sorting by name returns products from Z to A",
    { tag: ["@regression"] },
    async ({ inventoryPage }) => {
      await inventoryPage.goto();
      await inventoryPage.sortBy("Name (Z to A)");

      const names = await inventoryPage.productNames();
      const sorted = [...names].sort((a, b) => b.localeCompare(a));
      expect(names).toEqual(sorted);
    },
  );

  test(
    "cart contents survive a page reload",
    { tag: ["@regression"] },
    async ({ inventoryPage, page }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart("Sauce Labs Fleece Jacket");
      await inventoryPage.expectCartCount(1);

      await page.reload();

      await inventoryPage.expectLoaded();
      await inventoryPage.expectCartCount(1);
    },
  );
});
