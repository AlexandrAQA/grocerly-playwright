import { type Page, type Locator, expect } from "@playwright/test";

const slug = (productName: string): string =>
  productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly items: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
  }

  async goto(): Promise<void> {
    await this.page.goto("/inventory.html");
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toHaveText("Products");
    await expect(this.items.first()).toBeVisible();
  }

  addToCartButton(productName: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${slug(productName)}"]`);
  }

  removeButton(productName: string): Locator {
    return this.page.locator(`[data-test="remove-${slug(productName)}"]`);
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
    await expect(this.removeButton(productName)).toBeVisible();
  }

  /** Price of a product as a number, so tests can assert on money, not strings. */
  async priceOf(productName: string): Promise<number> {
    const card = this.items.filter({ hasText: productName }).first();
    const raw = await card
      .locator('[data-test="inventory-item-price"]')
      .innerText();
    return Number(raw.replace(/[^0-9.]/g, ""));
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      return;
    }
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async sortBy(optionLabel: string): Promise<void> {
    await this.sortSelect.selectOption({ label: optionLabel });
  }

  async productNames(): Promise<string[]> {
    return this.items
      .locator('[data-test="inventory-item-name"]')
      .allInnerTexts();
  }
}
