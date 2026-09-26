import AxeBuilder from '@axe-core/playwright';
import { expect, test, waitForHydration } from '@tests/e2e/fixtures';
import { siteRoutes } from '@tests/e2e/routes';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
// Serious and critical issues block the PR; minor ones are reported only.
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

for (const colorScheme of ['light', 'dark'] as const) {
    for (const route of siteRoutes()) {
        test(`${route} has no serious accessibility issues (${colorScheme})`, async ({
            page,
        }) => {
            await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
            await page.goto(route);
            await waitForHydration(page);

            const results = await new AxeBuilder({ page })
                .withTags(WCAG_TAGS)
                .exclude('iframe')
                .analyze();
            const blocking = results.violations
                .filter((violation) =>
                    BLOCKING_IMPACTS.has(violation.impact ?? '')
                )
                .map((violation) => ({
                    rule: violation.id,
                    impact: violation.impact,
                    help: violation.help,
                    targets: violation.nodes
                        .slice(0, 3)
                        .map((node) => node.target.join(' ')),
                }));

            expect(blocking).toEqual([]);
        });
    }
}
