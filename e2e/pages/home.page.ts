import { type Page, type Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly heading: Locator;
    readonly browseCategoriesButton: Locator;
    readonly searchProductsButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', {name: 'Grocerly'});
        this.searchProductsButton = page.getByRole('button', { name: 'Search products' });
        this.browseCategoriesButton = page.getByRole('button', {name: 'Browse categories'})
    }

    async goto() {
        await this.page.goto('/');
    }

    async openCategories(){
        await this.browseCategoriesButton.click();
    }
}
