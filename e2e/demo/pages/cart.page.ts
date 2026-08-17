import { type Page, type Locator, expect } from "@playwright/test";

const slug = (productName: string): string =>
  productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator(
      '[data-test="continue-shopping"]',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto("/cart.html");
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toHaveText("Your Cart");
  }

  async expectContains(productNames: string[]): Promise<void> {
    await expect(this.items).toHaveCount(productNames.length);
    for (const name of productNames) {
      await expect(this.items.filter({ hasText: name })).toHaveCount(1);
    }
  }

  async remove(productName: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${slug(productName)}"]`).click();
    await expect(this.items.filter({ hasText: productName })).toHaveCount(0);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
