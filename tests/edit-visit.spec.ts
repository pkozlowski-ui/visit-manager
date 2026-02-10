import { test, expect } from '@playwright/test';

test.describe('Edit Visit Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should update and delete a visit', async ({ page }) => {
        // 1. Create a visit
        await page.locator('button.fixed.bottom-24').click({ force: true });
        await page.fill('input[type="time"]', '14:00');
        await page.getByPlaceholder('e.g. Anna Nowak').fill('Original Client');
        await page.getByPlaceholder('e.g. Haircut & Color').fill('Service X');
        await page.getByRole('button', { name: /zapisz/i }).click({ force: true });

        // Verify creation
        await expect(page.getByText('Original Client')).toBeVisible();

        // 2. Open Edit Modal
        await page.getByText('Original Client').click();

        // Verify Edit Mode
        await expect(page.getByRole('heading', { name: /edytuj wizytę/i })).toBeVisible();
        await expect(page.getByPlaceholder('e.g. Anna Nowak')).toHaveValue('Original Client');

        // 3. Update Visit
        await page.getByPlaceholder('e.g. Anna Nowak').fill('Updated Client');
        await page.getByRole('button', { name: /aktualizuj/i }).click({ force: true });

        // Verify Update
        await expect(page.getByText('Original Client')).not.toBeVisible();
        await expect(page.getByText('Updated Client')).toBeVisible();

        // 4. Delete Visit
        await page.getByText('Updated Client').click();

        // Handle Confirm Dialog
        page.on('dialog', dialog => dialog.accept());

        // Click Delete button (Red trash icon)
        // I'll use the locator for the red button with trash icon
        await page.locator('button.text-red-500').click();

        // Verify Deletion
        await expect(page.getByText('Updated Client')).not.toBeVisible();
    });
});
