import { test, expect } from '@playwright/test';

test.describe('Core Visit Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should create a new visit in Simple Mode', async ({ page }) => {
        // 1. Open Modal via FAB
        await page.locator('button.fixed.bottom-24').click({ force: true }); // FAB

        // 2. Fill Form
        // Assuming default Simple Mode
        await page.fill('input[type="time"]', '10:00');
        await page.getByPlaceholder('e.g. Anna Nowak').fill('Test Client');
        await page.getByPlaceholder('e.g. Haircut & Color').fill('Test Service');

        // 3. Save
        await page.getByRole('button', { name: /zapisz/i }).click({ force: true });

        // 4. Verify on Timeline
        // Look for the card with client name
        const visitCard = page.getByText('Test Client');
        await expect(visitCard).toBeVisible();
        await expect(page.getByText('Test Service')).toBeVisible();
    });

    test('should persist visit after reload', async ({ page }) => {
        // 1. Create Visit
        await page.locator('button.fixed.bottom-24').click({ force: true });
        await page.fill('input[type="time"]', '12:00');
        await page.getByPlaceholder('e.g. Anna Nowak').fill('Persistent Client');
        await page.getByPlaceholder('e.g. Haircut & Color').fill('Service A');
        await page.getByRole('button', { name: /zapisz/i }).click({ force: true });

        // 2. Reload
        await page.reload();

        // 3. Verify
        await expect(page.getByText('Persistent Client')).toBeVisible();
    });
});
