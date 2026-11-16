import type { Page } from '@playwright/test';
import {
    expect,
    publishedArticles,
    test,
    waitForHydration,
} from '@tests/e2e/fixtures';
import { siteRoutes } from '@tests/e2e/routes';

// Tailwind's `md` breakpoint, where the desktop pill nav replaces the menu.
const DESKTOP_NAV_MIN_WIDTH = 768;

/**
 * Fails when the page is wider than the screen, naming the first elements that
 * stick out (content inside a horizontally scrollable box does not count).
 */
async function expectNoSidewaysScroll(page: Page): Promise<void> {
    const overflow = await page.evaluate(() => {
        const pageWidth = document.documentElement.scrollWidth;
        const viewportWidth = document.documentElement.clientWidth;
        const culprits = [...document.querySelectorAll('body *')]
            .filter((element) => {
                const box = element.getBoundingClientRect();
                return box.width > 0 && box.right > viewportWidth + 1;
            })
            .filter((element) => {
                let parent = element.parentElement;
                while (parent) {
                    const style = getComputedStyle(parent);
                    if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
                        return false;
                    }
                    parent = parent.parentElement;
                }
                return true;
            })
            .slice(0, 5)
            .map((element) => element.outerHTML.slice(0, 120));
        return { pageWidth, viewportWidth, culprits };
    });

    expect(
        overflow.pageWidth,
        overflow.culprits.join('\n')
    ).toBeLessThanOrEqual(overflow.viewportWidth);
}

for (const route of siteRoutes()) {
    test.describe(`layout: ${route}`, () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(route);
            await waitForHydration(page);
        });

        test('never scrolls sideways', async ({ page }) => {
            await expectNoSidewaysScroll(page);
        });

        test('shows the navigation that fits the screen', async ({ page }) => {
            const viewportWidth = page.viewportSize()!.width;
            const menuButton = page.getByRole('button', { name: 'Open menu' });

            if (viewportWidth >= DESKTOP_NAV_MIN_WIDTH) {
                await expect(
                    page.getByRole('navigation', { name: 'Primary' }).first()
                ).toBeVisible();
                await expect(menuButton).toBeHidden();
            } else {
                await expect(menuButton).toBeVisible();
            }
        });

        test('keeps images inside the viewport', async ({ page }) => {
            const viewportWidth = page.viewportSize()!.width;
            for (const image of await page.locator('main img:visible').all()) {
                const box = await image.boundingBox();
                if (box) {
                    expect(box.width).toBeLessThanOrEqual(viewportWidth);
                }
            }
        });
    });
}

// siteRoutes() holds only the newest article, so an older one with a long line
// (an unbroken URL in inline code, a wide table) would slip past the sweep above.
test.describe('every other article fits the screen', () => {
    for (const article of publishedArticles().slice(1)) {
        test(`${article.slug} never scrolls sideways`, async ({ page }) => {
            await page.goto(article.path);
            await waitForHydration(page);

            await expectNoSidewaysScroll(page);
        });
    }
});
