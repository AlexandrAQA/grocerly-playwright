import { type Page, type Locator } from "@playwright/test";

export class AuthPage {
    readonly page: Page;
    readonly authHost: Locator;


    constructor(page: Page){
        this.page = page;
        this.authHost = page.locator('.auth-host')
    }
}