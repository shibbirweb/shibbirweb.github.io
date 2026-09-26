import { expect, test, waitForHydration } from '@tests/e2e/fixtures';
import { siteRoutes } from '@tests/e2e/routes';

// Tailwind's `md` breakpoint, where the desktop pill nav replaces the menu.
const DESKTOP_NAV_MIN_WIDTH = 768;

for (const route of siteRoutes()) {
    test.describe(`layout: ${route}`, () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(route);
            await waitForHydration(page);
        });

        test('never scrolls sideways', async ({ page }) => {
            const overflow = await page.evaluate(() => {
                const pageWidth = document.documentElement.scrollWidth;
                const viewportWidth = document.documentElement.clientWidth;
                const culprits = [...document.querySelectorAll('body *')]
                    .filter((element) => {
                        const box = element.getBoundingClientRect();
                        return box.width > 0 && box.right > viewportWidth + 1;
                    })
                    .filter((element) => {
                        // Content inside a horizontally scrollable box is fine.
                        let parent = element.parentElement;
                        while (parent) {
                            const style = getComputedStyle(parent);
                            if (
                                /(auto|scroll|hidden|clip)/.test(
                                    style.overflowX
                                )
                            ) {
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
