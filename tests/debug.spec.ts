import { test, expect } from '@playwright/test';

test('debug modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('button.fixed.bottom-24').click({ force: true });

    // Wait for modal
    await expect(page.locator('form')).toBeVisible();

    // Screenshot
    await page.screenshot({ path: 'debug-modal.png' });

    // Log button text
    const buttons = page.locator('button[type="submit"]');
    const count = await buttons.count();
    console.log(`Found ${count} submit buttons`);
    if (count > 0) {
        console.log('Button text:', await buttons.first().textContent());
    }
});
