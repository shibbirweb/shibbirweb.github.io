import type { Page } from '@playwright/test';
import { expect, test } from '@tests/e2e/fixtures';

async function resolvedTheme(page: Page) {
    return page.evaluate(() => document.documentElement.dataset.theme);
}

async function chooseTheme(page: Page, isMobile: boolean, label: string) {
    if (isMobile) {
        await page.getByRole('button', { name: 'Open menu' }).click();
        await page.getByRole('button', { name: `${label} theme` }).click();
        return;
    }
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await page.getByRole('menuitemradio', { name: label }).click();
}

test.describe('theme', () => {
    test('follows the system colour scheme by default', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto('/');
        expect(await resolvedTheme(page)).toBe('dark');

        await page.emulateMedia({ colorScheme: 'light' });
        await page.reload();
        expect(await resolvedTheme(page)).toBe('light');
    });

    test('remembers a chosen theme across reloads', async ({
        page,
        isMobile,
    }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('/');
        await chooseTheme(page, isMobile, 'Dark');

        await expect.poll(() => resolvedTheme(page)).toBe('dark');
        expect(
            await page.evaluate(() => window.localStorage.getItem('theme'))
        ).toBe('dark');

        await page.reload();
        expect(await resolvedTheme(page)).toBe('dark');
    });

    test('applies the saved theme before any app code runs', async ({
        page,
    }) => {
        // With every Next.js chunk blocked, only the inline ThemeScript in
        // <head> can set the attribute, which proves there is no flash.
        await page.route('**/_next/static/chunks/**', (route) => route.abort());
        await page.addInitScript(() => {
            window.localStorage.setItem('theme', 'dark');
        });
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        expect(await resolvedTheme(page)).toBe('dark');
    });
});
