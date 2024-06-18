import { test } from '@playwright/test';

import HomePage from '../pages/homePage';
import StorePage from '../pages/storePage';

test.describe('APEX - Liverpool', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.liverpool.com.mx/tienda/home');
    });

    test.describe('searchbar', () => {
        test('Search for a product using searchbar', async ({ page }) => {
            const homePage = new HomePage(page);
            const storePage = new StorePage(page);
            await homePage.searchForProduct('smart tv');
            await storePage.assertProductCount();
        });

        test('Search for a non-existent product using searchbar', async ({ page }) => {
            const homePage = new HomePage(page);
            const storePage = new StorePage(page);
            await homePage.searchForProduct('asdasd');
            await storePage.assertItemNotFound();
        });
    });

    test.describe('Buying an item', async () => {
        test.beforeEach(async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.searchForProduct('smart tv');
        });

        test('Filter items by brand', async ({ page }) => {
            const storePage = new StorePage(page);
            let responsePromise = page.waitForResponse(response => response.url().includes('https://www.liverpool.com.mx/getPlpFilter') && response.status() === 202);
            await storePage.filterByPriceRange(0, 15000);
            await responsePromise;
            await storePage.assertFiltersApplied(1);
            responsePromise = page.waitForResponse(response => response.url().includes('https://www.liverpool.com.mx/getPlpFilter') && response.status() === 202);
            await storePage.filterByBrand('samsung');
            await responsePromise;
            await storePage.assertFiltersApplied(2);
            responsePromise = page.waitForResponse(response => response.url().includes('https://www.liverpool.com.mx/getPlpFilter') && response.status() === 202);
            await storePage.filterBySize('50');
            await responsePromise;
            await storePage.assertFiltersApplied(3);
            await storePage.assertItemsDescription('samsung', '50', 0, 15000);
        });

    });
});