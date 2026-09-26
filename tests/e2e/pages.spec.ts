import { nowSections } from '@/app/now/contents';
import { resumeName, resumeSections } from '@/app/resume/contents';
import { usesSections } from '@/app/uses/contents';
import { expect, test } from '@tests/e2e/fixtures';

test.describe('resume', () => {
    test('shows the resume with every section', async ({ page }) => {
        await page.goto('/resume');
        const main = page.locator('main');

        await expect(main.getByRole('heading', { level: 1 })).toContainText(
            resumeName
        );
        for (const section of resumeSections) {
            await expect(
                main.getByRole('heading', { name: section.label, exact: true })
            ).toBeAttached();
        }
    });

    test('prints the page when "Download PDF" is clicked', async ({ page }) => {
        await page.addInitScript(() => {
            window.print = () => {
                document.body.dataset.printed = 'true';
            };
        });
        await page.goto('/resume');
        await page.getByRole('button', { name: 'Download PDF' }).click();

        await expect(page.locator('body')).toHaveAttribute(
            'data-printed',
            'true'
        );
    });
});

test.describe('now and uses', () => {
    test('shows every "now" card', async ({ page }) => {
        await page.goto('/now');

        for (const section of nowSections) {
            await expect(
                page.getByRole('heading', { name: section.title, exact: true })
            ).toBeAttached();
        }
    });

    test('shows every "uses" card', async ({ page }) => {
        await page.goto('/uses');

        for (const section of usesSections) {
            await expect(
                page.getByRole('heading', { name: section.title, exact: true })
            ).toBeAttached();
        }
    });
});

test.describe('error and status pages', () => {
    test('answers an unknown URL with the 404 page', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist');

        expect(response?.status()).toBe(404);
        await expect(
            page.getByRole('heading', { name: 'This page wandered off' })
        ).toBeVisible();
        await page.getByRole('link', { name: 'Back home' }).click();
        await expect(page).toHaveURL(/\/$/);
    });

    test('reports the connection as online on the network status page', async ({
        page,
    }) => {
        await page.goto('/network-status');

        await expect(page.locator('[data-network-root]')).toHaveAttribute(
            'data-status',
            'online',
            { timeout: 10_000 }
        );
    });
});
