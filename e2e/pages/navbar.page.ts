import { type Page, type Locator } from '@playwright/test';

export class NavbarPage {
    readonly page: Page;
    readonly signInButton: Locator;
    readonly signUpButton: Locator;
    readonly myOrdersLink: Locator;
    readonly membershipLink: Locator;
    readonly adminLink: Locator;
    readonly themeSwitch: Locator;

    constructor(page: Page) {
        this.page = page;
        this.signInButton = page.getByRole('button', { name: 'Sign in'});
        this.signUpButton = page.getByRole('button', { name: 'Sign up'});
        this.myOrdersLink = page.getByRole('link', {name: 'My Orders'});
        this.membershipLink = page.getByRole('link', { name: 'Membership'})
        this.adminLink = page.getByRole('link', { name: 'Admin' });
        this.themeSwitch = page.getByRole('switch');
    }

    async toggleTheme() {
        await this.themeSwitch.click();
    }
}
