import { expect, Locator, Page } from "@playwright/test";

class StorePage {
    private readonly page: Page;

    private readonly searchBrandFilterInput: Locator;
    private readonly brandFilterCheckbox: Locator;
    private readonly sizeFilterContainer: Locator;
    private readonly minPriceInput: Locator;
    private readonly maxPriceInput: Locator;
    private readonly countProductsLabel: Locator;
    private readonly itemNotFoundContainer: Locator;
    private readonly filtersAppliedContainer: string;
    private readonly filterPriceButton: Locator;
    private readonly itemDescriptionContainer: Locator;
    private readonly itemPriceContainer: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchBrandFilterInput = page.locator('#searchBrand');
        this.brandFilterCheckbox = page.locator('#brandFilterWEB').getByRole('checkbox');
        this.sizeFilterContainer = page.locator('.m-plp__filterSection', { hasText: 'Tamaño' });
        this.minPriceInput = page.locator('input[id="min-price-filter"]');
        this.maxPriceInput = page.locator('input[id="max-price-filter"]');
        this.countProductsLabel = page.locator('.a-plp-results-title');
        this.itemNotFoundContainer = page.locator('.o-content__noResultsNullSearch');
        this.filtersAppliedContainer = '.m-plp__filterApplied .mdc-chip-set';
        this.filterPriceButton = page.locator('.a-price__filterButton');
        this.itemDescriptionContainer = page.locator('.card-title');
        this.itemPriceContainer = page.locator('.a-card-discount');
    }

    async filterByBrand(brand: string) {
        await this.searchBrandFilterInput.fill(brand);
        await this.brandFilterCheckbox.check();
    }

    async filterBySize(size: string) {
        await expect(this.sizeFilterContainer.locator(`input[id*="${size} pulgadas"]`)).toBeVisible();
        await this.sizeFilterContainer.locator(`input[id*="${size} pulgadas"]`).check();
    }

    async filterByPriceRange(minPrice: number, maxPrice: number) {
        await expect(this.minPriceInput).toBeVisible();
        await expect(this.maxPriceInput).toBeVisible();
        await this.minPriceInput.fill(String(minPrice));
        await this.maxPriceInput.fill(String(maxPrice));
        await this.filterPriceButton.click();

    }

    async assertProductCount() {
        const text = await this.countProductsLabel.innerText();
        const count = parseInt(text.split(' ')[0]);
        expect(count).toBeGreaterThan(0);
    }

    async assertItemNotFound() {
        await expect(this.itemNotFoundContainer).toBeVisible();
        expect(await this.itemNotFoundContainer.innerText()).toContain('Lo sentimos, no encontramos nada para');
    }

    async assertFiltersApplied(filters: number) {
        await this.page.waitForFunction(args => {
            const elements = document.querySelectorAll(args[0].toString());
            return elements.length === args[1];
        }, [this.filtersAppliedContainer, filters], { timeout: 10000 });
    }

    async assertItemsDescription(brand: string, size: string, minPrice: number, maxPrice: number) {
        await this.page.waitForTimeout(1000);
        await this.itemDescriptionContainer.allInnerTexts().then((texts) => {
            texts.forEach((text) => {
                text = text.toLowerCase();
                expect(text).toContain(brand.toLowerCase());
                expect(text).toContain(size.toLowerCase());
            });
        });
        await this.itemPriceContainer.allInnerTexts().then((texts) => {
            texts.forEach((text) => {
                const price = text.replace('$', '').replace(',', '');
                let priceString = price.slice(0, price.length-2) + "." + price.slice(price.length-2);
                const priceWithCents = parseFloat(priceString);
                expect(priceWithCents).toBeGreaterThanOrEqual(minPrice);
                expect(priceWithCents).toBeLessThanOrEqual(maxPrice);
            });
        });
    }
}


export default StorePage;