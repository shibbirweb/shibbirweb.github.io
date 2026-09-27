import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test, waitForHydration } from '@tests/e2e/fixtures';
import { siteRoutes } from '@tests/e2e/routes';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
// Serious and critical issues block the PR; minor ones are reported only.
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);
const COLOR_SCHEMES = ['light', 'dark'] as const;

async function blockingViolations(page: Page) {
    const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .exclude('iframe')
        .analyze();
    return results.violations
        .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''))
        .map((violation) => ({
            rule: violation.id,
            impact: violation.impact,
            help: violation.help,
            targets: violation.nodes
                .slice(0, 3)
                .map((node) => node.target.join(' ')),
        }));
}

for (const colorScheme of COLOR_SCHEMES) {
    for (const route of siteRoutes()) {
        test(`${route} has no serious accessibility issues (${colorScheme})`, async ({
            page,
        }) => {
            await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
            await page.goto(route);
            await waitForHydration(page);

            expect(await blockingViolations(page)).toEqual([]);
        });
    }

    // The sweep above sees the home page collapsed, so the cards behind each
    // "Show more" are only checked once they are revealed here.
    test(`/ has no serious accessibility issues with every project revealed (${colorScheme})`, async ({
        page,
    }) => {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
        await page.goto('/');
        await waitForHydration(page);

        const toggles = page
            .locator('#work')
            .getByRole('button', { name: 'Show more' });
        await expect(toggles).not.toHaveCount(0);
        while ((await toggles.count()) > 0) {
            await toggles.first().click();
        }

        expect(await blockingViolations(page)).toEqual([]);
    });
}
