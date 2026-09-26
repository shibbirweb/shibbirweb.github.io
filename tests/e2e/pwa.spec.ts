import type { Page } from '@playwright/test';
import { expect, test } from '@tests/e2e/fixtures';

// This spec needs the real service worker, which the config blocks elsewhere.
test.use({ serviceWorkers: 'allow' });

async function waitForControllingWorker(page: Page) {
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
    });
    // The first load is not controlled yet; a reload brings it under the worker.
    await page.reload();
    await expect
        .poll(() =>
            page.evaluate(() => Boolean(navigator.serviceWorker.controller))
        )
        .toBe(true);
}

test.describe('progressive web app', () => {
    test.skip(({ isMobile }) => isMobile, 'covered once on desktop');

    test('registers a service worker that controls the page', async ({
        page,
    }) => {
        await page.goto('/');
        await waitForControllingWorker(page);

        const scriptUrl = await page.evaluate(
            () => navigator.serviceWorker.controller?.scriptURL ?? ''
        );
        expect(new URL(scriptUrl).pathname).toBe('/sw.js');
    });

    test('never reloads a first-time visitor when the worker takes over', async ({
        page,
    }) => {
        let loads = 0;
        page.on('load', () => {
            loads += 1;
        });
        await page.goto('/');
        const nameField = page.locator('#contact form').getByLabel('Name');
        await nameField.fill('typed before the worker installed');

        await page.evaluate(async () => {
            await navigator.serviceWorker.ready;
        });
        await expect
            .poll(() =>
                page.evaluate(() => Boolean(navigator.serviceWorker.controller))
            )
            .toBe(true);
        await page.waitForTimeout(1_000);

        expect(loads).toBe(1);
        await expect(nameField).toHaveValue(
            'typed before the worker installed'
        );
    });

    test('keeps the home page available offline', async ({ page, context }) => {
        await page.goto('/');
        await waitForControllingWorker(page);

        await context.setOffline(true);
        await page.reload();
        await expect(page.locator('#hero h1')).toBeVisible();
        await context.setOffline(false);
    });

    test('shows the offline page for a page never visited', async ({
        page,
        context,
    }) => {
        await page.goto('/');
        await waitForControllingWorker(page);

        await context.setOffline(true);
        await page.goto('/uses');
        await expect(page.locator('[data-network-root]')).toHaveAttribute(
            'data-status',
            'offline'
        );
        await context.setOffline(false);
    });
});
