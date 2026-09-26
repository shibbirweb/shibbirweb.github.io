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

/** Serves the mocked calendar for every proxy request, counting them. */
async function mockProxy(page: Page) {
    const requests = { count: 0 };
    await page.route(githubActivityURL, (route) => {
        requests.count++;
        return route.fulfill({ json: yearOfContributions() });
    });
    return requests;
}

async function openFooter(page: Page) {
    await page.goto('/');
    await waitForHydration(page);
    await page.locator('footer').scrollIntoViewIfNeeded();
}

/**
 * A fingerprint of what the graph canvas shows right now, plus how many
 * pixels are painted at all, read inside the page from its 2D context.
 */
async function readCanvas(page: Page) {
    return page.locator('footer canvas').evaluate((element) => {
        const canvas = element as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        if (!context || canvas.width === 0 || canvas.height === 0) {
            return { fingerprint: 0, paintedPixels: 0 };
        }
        const { data } = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );
        let fingerprint = 0;
        let paintedPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
            fingerprint = (fingerprint * 31 + data[i] + data[i + 3]) >>> 0;
            if (data[i + 3] > 0) {
                paintedPixels++;
            }
        }
        return { fingerprint, paintedPixels };
    });
}

/**
 * Waits until the canvas stops changing. The fade from the decorative graph
 * onto the real calendar runs about four seconds after the footer appears,
 * and a slow runner stretches that, so this allows well beyond the default
 * five-second poll.
 */
async function waitForStillCanvas(page: Page) {
    let previous = -1;
    await expect
        .poll(
            async () => {
                const { fingerprint } = await readCanvas(page);
                const isStill = fingerprint === previous;
                previous = fingerprint;
                return isStill;
            },
            { intervals: [400], timeout: 15_000 }
        )
        .toBe(true);
}

async function hoverSignature(page: Page) {
    const box = await page.locator('footer svg').first().boundingBox();
    if (!box) {
        throw new Error('footer signature has no box');
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

// The spotlight element (which usePointerSpotlight writes to) is the canvas's
// grandparent: canvas -> graph layer -> spotlight.
async function readSpotlightOpacity(page: Page): Promise<string> {
    return page
        .locator('footer canvas')
        .evaluate(
            (canvas) =>
                (
                    canvas.parentElement?.parentElement as HTMLElement | null
                )?.style.getPropertyValue('--spotlight-opacity') ?? ''
        );
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

test.describe('footer graph with a mouse', () => {
    test.skip(({ isMobile }) => isMobile, 'hover needs a fine pointer');

    test('paints the decorative graph when the proxy is out of reach', async ({
        page,
    }) => {
        // No mock: the fixture blocks every third-party request.
        await openFooter(page);

        await expect
            .poll(async () => (await readCanvas(page)).paintedPixels)
            .toBeGreaterThan(0);
    });

    test('brightens gradually on hover and fades when the pointer leaves', async ({
        page,
    }) => {
        await mockProxy(page);
        await openFooter(page);

        // Record the spotlight's brightness on every frame from before the
        // pointer arrives, so a slow page cannot make the rise look like a jump.
        await page.locator('footer canvas').evaluate((canvas) => {
            const spotlight = canvas.parentElement
                ?.parentElement as HTMLElement;
            const samples: number[] = [];
            (
                window as unknown as { spotlightSamples: number[] }
            ).spotlightSamples = samples;
            const start = performance.now();
            const sample = () => {
                samples.push(
                    parseFloat(
                        spotlight.style.getPropertyValue('--spotlight-opacity')
                    ) || 0
                );
                if (performance.now() - start < 4000) {
                    requestAnimationFrame(sample);
                }
            };
            requestAnimationFrame(sample);
        });
        await hoverSignature(page);
        await expect
            .poll(async () => parseFloat(await readSpotlightOpacity(page)))
            .toBeGreaterThan(0.8);
        const samples = await page.evaluate(
            () =>
                (window as unknown as { spotlightSamples: number[] })
                    .spotlightSamples
        );

        const lit = samples.filter((value) => value > 0);
        expect(samples[0], 'dark before the pointer arrives').toBe(0);
        expect(
            lit.filter((value) => value > 0.05 && value < 0.6).length,
            'passes through in-between brightness on the way up'
        ).toBeGreaterThanOrEqual(2);
        lit.slice(1).forEach((value, index) => {
            expect(value, 'rises without jumping back').toBeGreaterThanOrEqual(
                lit[index] - 0.001
            );
        });

        await page.mouse.move(1, 1);
        await expect
            .poll(async () => parseFloat(await readSpotlightOpacity(page)))
            .toBeLessThan(0.01);
    });

    test('breathes while hovered and holds still at rest', async ({ page }) => {
        await mockProxy(page);
        await openFooter(page);
        await page.mouse.move(1, 1);
        await waitForStillCanvas(page);

        const atRest = (await readCanvas(page)).fingerprint;
        await page.waitForTimeout(700);
        expect((await readCanvas(page)).fingerprint).toBe(atRest);

        await hoverSignature(page);
        await page.waitForTimeout(800);
        const breathing = (await readCanvas(page)).fingerprint;
        await page.waitForTimeout(700);
        expect((await readCanvas(page)).fingerprint).not.toBe(breathing);
    });

    test('holds the graph still under reduced motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await mockProxy(page);
        await openFooter(page);
        await waitForStillCanvas(page);

        await hoverSignature(page);
        await expect
            .poll(async () => parseFloat(await readSpotlightOpacity(page)))
            .toBeGreaterThan(0.5);
        const lit = (await readCanvas(page)).fingerprint;
        await page.waitForTimeout(700);
        expect((await readCanvas(page)).fingerprint).toBe(lit);
    });

    test('redraws in the new colours when the theme switches', async ({
        page,
    }) => {
        await mockProxy(page);
        await openFooter(page);
        await waitForStillCanvas(page);
        const before = (await readCanvas(page)).fingerprint;

        await page.evaluate(() => {
            const root = document.documentElement;
            const isDark =
                root.dataset.theme === 'dark' ||
                (!root.dataset.theme &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches);
            root.dataset.theme = isDark ? 'light' : 'dark';
        });

        await expect
            .poll(async () => (await readCanvas(page)).fingerprint)
            .not.toBe(before);
    });
});

test.describe('footer graph on a touch screen', () => {
    test.skip(({ isMobile }) => !isMobile, 'runs on the mobile project');

    test('shows the still graph and never lights the spotlight', async ({
        page,
    }) => {
        await mockProxy(page);
        await openFooter(page);

        await expect
            .poll(async () => (await readCanvas(page)).paintedPixels)
            .toBeGreaterThan(0);
        await page.locator('footer svg').first().tap();
        await page.waitForTimeout(500);
        expect(await readSpotlightOpacity(page)).toBe('');
    });
});
