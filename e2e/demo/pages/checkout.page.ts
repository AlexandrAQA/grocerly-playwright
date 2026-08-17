import { type Page, type Locator, expect } from "@playwright/test";

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutPage {
  readonly page: Page;
  readonly title: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.error = page.locator('[data-test="error"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  async fillCustomerDetails(details: CustomerDetails): Promise<void> {
    await this.firstName.fill(details.firstName);
    await this.lastName.fill(details.lastName);
    await this.postalCode.fill(details.postalCode);
    await this.continueButton.click();
  }

  /** Money is parsed into numbers so assertions describe amounts, not text. */
  private async amountFrom(locator: Locator): Promise<number> {
    const raw = await locator.innerText();
    return Number(raw.replace(/[^0-9.]/g, ""));
  }

  async expectTotalsAddUp(expectedSubtotal: number): Promise<void> {
    await expect(this.subtotalLabel).toBeVisible();

    const subtotal = await this.amountFrom(this.subtotalLabel);
    const tax = await this.amountFrom(this.taxLabel);
    const total = await this.amountFrom(this.totalLabel);

    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
    await expect(this.completeHeader).toHaveText(/thank you for your order/i);
  }
}
