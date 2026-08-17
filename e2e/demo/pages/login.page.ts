import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Locator strategy: role-based locators are used wherever the application
 * exposes a stable accessible name; the demo shop also ships explicit
 * `data-test` hooks, which are preferred over CSS structure because they
 * survive markup refactoring.
 */
export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.error = page.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
    await expect(this.loginButton).toBeVisible();
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toContainText(message);
  }
}
