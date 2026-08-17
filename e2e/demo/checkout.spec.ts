import { test, expect, STORAGE_STATE } from "./fixtures";
import type { CustomerDetails } from "./pages/checkout.page";

test.use({ storageState: STORAGE_STATE });

const customer: CustomerDetails = {
  firstName: "Alex",
  lastName: "Panaev",
  postalCode: "30-001",
};

const cart = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];

test.describe("checkout customer journey", () => {
  test(
    "user can buy two products and reach the order confirmation",
    { tag: ["@smoke", "@e2e"] },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.goto();

      let expectedSubtotal = 0;
      for (const product of cart) {
        expectedSubtotal += await inventoryPage.priceOf(product);
        await inventoryPage.addToCart(product);
      }
      await inventoryPage.expectCartCount(cart.length);

      await inventoryPage.openCart();
      await cartPage.expectLoaded();
      await cartPage.expectContains(cart);
      await cartPage.checkout();

      await checkoutPage.fillCustomerDetails(customer);
      await checkoutPage.expectTotalsAddUp(expectedSubtotal);
      await checkoutPage.finish();
    },
  );

  test(
    "removing a product keeps the cart and the order total consistent",
    { tag: ["@regression"] },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.goto();

      const kept = cart[0] as string;
      const removed = cart[1] as string;
      const keptPrice = await inventoryPage.priceOf(kept);

      await inventoryPage.addToCart(kept);
      await inventoryPage.addToCart(removed);
      await inventoryPage.openCart();

      await cartPage.remove(removed);
      await cartPage.expectContains([kept]);
      await cartPage.checkout();

      await checkoutPage.fillCustomerDetails(customer);
      await checkoutPage.expectTotalsAddUp(keptPrice);
    },
  );

  test(
    "checkout requires customer details",
    { tag: ["@regression"] },
    async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart(cart[0] as string);
      await inventoryPage.openCart();
      await cartPage.checkout();

      await checkoutPage.continueButton.click();

      await expect(checkoutPage.error).toBeVisible();
      await expect(checkoutPage.error).toContainText(/first name is required/i);
    },
  );
});
