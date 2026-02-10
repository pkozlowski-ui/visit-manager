import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/visit-manager/);
});

test('visual regression home', async ({ page }) => {
    await page.goto('/');
    // Expect the page to match the snapshot
    await expect(page).toHaveScreenshot();
});
