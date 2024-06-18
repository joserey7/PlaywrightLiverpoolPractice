import { Locator, Page } from "@playwright/test";

class HomePage {
    private readonly page: Page;

    private readonly searchInput: Locator;
    private readonly searchButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = page.locator("#mainSearchbar");
        this.searchButton = page.locator("button.input-group-text:visible").filter({ has: page.locator('.icon-zoom') });
    }

    async searchForProduct(product: string) {
        await this.searchInput.fill(product);
        await this.searchButton.click();
    }
}

export default HomePage;