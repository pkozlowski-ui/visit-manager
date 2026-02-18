import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Backup & Restore Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Start with a clean state
        await page.goto('/settings');
        // Ensure local storage is cleared if needed, but the "Clear Data" button test covers this
    });

    test('should export data, clear it, and successfully restore from backup', async ({ page }) => {
        // 1. Generate Data (Add a Client)
        await page.goto('/clients');

        // Handling window.prompt for adding client
        page.on('dialog', async dialog => {
            if (dialog.type() === 'prompt') {
                await dialog.accept('Backup Test Client');
            } else if (dialog.type() === 'confirm') {
                await dialog.accept(); // For clear data confirmation
            } else if (dialog.type() === 'alert') {
                await dialog.dismiss(); // For success messages
            }
        });

        // Add Client FAB - accessible click
        await page.getByRole('button', { name: 'Add New Client' }).click();

        // Fill new client form
        await page.getByPlaceholder('FULL NAME...').fill('Backup Test Client');
        await page.getByRole('button', { name: 'Add Client' }).click();

        await expect(page.getByText('Backup Test Client')).toBeVisible();

        // 2. Export Backup
        await page.goto('/settings');

        // Setup download listener
        const downloadPromise = page.waitForEvent('download');
        // Use exact text match or specific locator
        await page.getByText('Export Backup').click({ force: true });
        const download = await downloadPromise;

        // Verify download
        expect(download.suggestedFilename()).toContain('visit-manager-backup');
        const backupPath = await download.path(); // Temporary path

        // 3. Clear Data
        // Handle confirm dialog (already set up in listener, but for safety in this specific step)
        // Note: global listener covers it.
        await page.getByText('Clear All Data').click({ force: true });

        // Allow reload to happen
        await page.waitForLoadState('networkidle');

        // Verify data is gone
        await page.goto('/clients');
        await expect(page.getByText('Backup Test Client')).toBeHidden();

        // 4. Import Backup
        await page.goto('/settings');
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(backupPath);

        // Allow reload to happen after import
        await page.waitForLoadState('networkidle');

        // 5. Verify Data Restored
        await page.goto('/clients');
        await expect(page.getByText('Backup Test Client')).toBeVisible();
    });
});
