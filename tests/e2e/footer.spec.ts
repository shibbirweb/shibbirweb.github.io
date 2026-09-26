import type { Page } from '@playwright/test';
import {
    githubActivityCacheKey,
    githubActivityDays,
    githubActivityURL,
} from '@/components/layout/Footer/SignatureSpotlight/contents';
import { toLocalIsoDate } from '@/components/layout/Footer/SignatureSpotlight/githubActivity';
import { expect, test, waitForHydration } from '@tests/e2e/fixtures';

// A year of contributions ending today, the shape the proxy returns, with the
// newest days all at level 4 so a trimmed cache is easy to recognise.
function yearOfContributions() {
    const today = new Date();
    return {
        total: { lastYear: 365 },
        contributions: Array.from({ length: 365 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (364 - index));
            const isRecent = index >= 365 - githubActivityDays;
            return {
                date: toLocalIsoDate(date),
                count: isRecent ? 9 : 0,
                level: isRecent ? 4 : 0,
            };
        }),
    };
}

async function readCachedLevels(page: Page): Promise<string | null> {
    return page.evaluate((cacheKey) => {
        const raw = window.localStorage.getItem(cacheKey);
        return raw ? (JSON.parse(raw) as { levels: string }).levels : null;
    }, githubActivityCacheKey);
}

test.describe('footer GitHub activity', () => {
    test('loads the calendar once the footer nears, then serves it from the cache', async ({
        page,
    }) => {
        let proxyRequests = 0;
        await page.route(githubActivityURL, (route) => {
            proxyRequests++;
            return route.fulfill({ json: yearOfContributions() });
        });

        await page.goto('/');
        await waitForHydration(page);
        expect(proxyRequests, 'no request before the footer nears').toBe(0);

        await page.locator('footer').scrollIntoViewIfNeeded();
        await expect.poll(() => proxyRequests).toBe(1);
        await expect
            .poll(() => readCachedLevels(page))
            .toBe('4'.repeat(githubActivityDays));

        await page.reload();
        await waitForHydration(page);
        await page.locator('footer').scrollIntoViewIfNeeded();
        await expect(page.locator('footer canvas')).toBeVisible();
        expect(proxyRequests, 'a fresh cache skips the proxy').toBe(1);
    });

    test('keeps the decorative graph when the proxy fails', async ({
        page,
    }) => {
        let proxyRequests = 0;
        await page.route(githubActivityURL, (route) => {
            proxyRequests++;
            return route.fulfill({ status: 503, body: 'unavailable' });
        });

        await page.goto('/');
        await waitForHydration(page);
        await page.locator('footer').scrollIntoViewIfNeeded();

        await expect.poll(() => proxyRequests).toBe(1);
        await expect(page.locator('footer canvas')).toBeVisible();
        expect(await readCachedLevels(page)).toBeNull();
    });
});
