import AxeBuilder from '@axe-core/playwright';
import {
    articlesWithFence,
    expect,
    publishedArticles,
    test,
    waitForHydration,
} from '@tests/e2e/fixtures';

const articles = publishedArticles();
const flowArticles = articlesWithFence('reactflow');

for (const article of articles) {
    test.describe(`article: ${article.slug}`, () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(article.path);
            await waitForHydration(page);
        });

        test('shows the title and tracks reading progress', async ({
            page,
        }) => {
            const progress = page.getByRole('progressbar', {
                name: 'Reading progress',
            });

            await expect(page.getByRole('heading', { level: 1 })).toHaveText(
                article.title
            );
            await expect(progress).toHaveAttribute('aria-valuenow', '0');
            await page.evaluate(() =>
                window.scrollTo(0, document.body.scrollHeight)
            );
            await expect
                .poll(async () =>
                    Number(await progress.getAttribute('aria-valuenow'))
                )
                .toBeGreaterThan(50);
        });

        test('renders every diagram instead of its source text', async ({
            page,
        }) => {
            await expect(page.locator('pre.mermaid:visible')).toHaveCount(0);
            await expect(page.locator('pre.reactflow:visible')).toHaveCount(0);
            for (const figure of await page
                .locator('figure:has(button[aria-label="Full view"])')
                .all()) {
                await figure.scrollIntoViewIfNeeded();
                await expect(figure.locator('svg').first()).toBeVisible();
            }
        });

        test('jumps to a heading from the table of contents', async ({
            page,
            isMobile,
        }) => {
            test.skip(isMobile, 'the sidebar TOC is desktop only');
            const toc = page.getByRole('navigation', {
                name: 'Table of contents',
            });
            const firstEntry = toc.getByRole('link').nth(1);
            test.skip(
                (await toc.getByRole('link').count()) < 2,
                'short article'
            );
            const target = (await firstEntry.getAttribute('href'))!;

            await firstEntry.click();
            await expect(page).toHaveURL(new RegExp(`${target}$`));
            await expect(page.locator(target)).toBeInViewport();
        });

        test('moves the TOC rail with the scroll, head first', async ({
            page,
            isMobile,
        }) => {
            test.skip(isMobile, 'the sidebar TOC is desktop only');
            const toc = page.getByRole('navigation', {
                name: 'Table of contents',
            });
            test.skip(
                (await toc.getByRole('link').count()) < 3,
                'too few headings to scroll through'
            );
            const thumb = toc.getByTestId('toc-rail-thumb');
            const head = toc.getByTestId('toc-rail-head');
            // The highlight's top inset and the head dot's y, from the inline
            // styles the rail writes (the dot is 6px, centred on its point).
            const readRail = () =>
                page.evaluate(() => {
                    const thumbStyle = document.querySelector<HTMLElement>(
                        '[data-testid="toc-rail-thumb"]'
                    )!.style.clipPath;
                    const headStyle = document.querySelector<HTMLElement>(
                        '[data-testid="toc-rail-head"]'
                    )!.style.transform;
                    return {
                        top: Number(
                            /inset\((-?[\d.]+)px/.exec(thumbStyle)?.[1]
                        ),
                        headY:
                            Number(
                                /translate\([^,]+,\s*(-?[\d.]+)px/.exec(
                                    headStyle
                                )?.[1]
                            ) + 3,
                    };
                });

            await page.mouse.move(400, 400);
            await page
                .getByRole('heading', { level: 2 })
                .nth(1)
                .scrollIntoViewIfNeeded();
            for (let step = 0; step < 4; step++) {
                await page.mouse.wheel(0, 300);
            }
            await expect(thumb).toHaveClass(/opacity-100/);
            await expect(head).toHaveClass(/opacity-100/);
            await expect
                .poll(async () => {
                    const rail = await readRail();
                    return rail.headY > rail.top;
                })
                .toBe(true);
            const scrolledDown = await readRail();

            await page.mouse.wheel(0, -1200);
            await expect
                .poll(async () => {
                    const rail = await readRail();
                    return rail.headY === rail.top;
                })
                .toBe(true);
            expect((await readRail()).top).toBeLessThanOrEqual(
                scrolledDown.top
            );
        });

        test('copies a code block to the clipboard', async ({
            page,
            context,
            browserName,
        }) => {
            const copyButton = page
                .getByRole('button', { name: 'Copy code' })
                .first();
            test.skip((await copyButton.count()) === 0, 'no code blocks');
            test.skip(
                browserName !== 'chromium',
                'clipboard permissions are Chromium only'
            );
            await context.grantPermissions([
                'clipboard-read',
                'clipboard-write',
            ]);
            const code = await page
                .locator('figure.code-block')
                .first()
                .locator('pre code')
                .innerText();

            await copyButton.scrollIntoViewIfNeeded();
            await copyButton.click();
            await expect(
                page.getByRole('button', { name: 'Copied' }).first()
            ).toBeVisible();
            expect(
                (
                    await page.evaluate(() => navigator.clipboard.readText())
                ).trim()
            ).toBe(code.trim());
        });

        test('offers every share target', async ({ page }) => {
            await page
                .getByRole('button', { name: 'Share this article' })
                .click();
            const menu = page.getByRole('menu', { name: 'Share this article' });

            await expect(menu).toBeVisible();
            for (const target of ['X', 'LinkedIn', 'Facebook', 'WhatsApp']) {
                await expect(
                    menu.getByRole('menuitem', { name: new RegExp(target) })
                ).toBeVisible();
            }
            await expect(
                menu.getByRole('menuitem', { name: 'Copy link' })
            ).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(menu).toBeHidden();
        });
    });
}

test.describe('flow diagrams', () => {
    test.skip(flowArticles.length === 0, 'no article uses a flow diagram');

    test('switches to the interactive view and steps through hops', async ({
        page,
    }) => {
        await page.goto(flowArticles[0].path);
        await waitForHydration(page);
        const switcher = page
            .getByRole('group', { name: 'Diagram rendering' })
            .first();
        await switcher.scrollIntoViewIfNeeded();
        await switcher.getByRole('button', { name: 'Interactive' }).click();

        const figure = page.locator('figure:has(.react-flow)').first();
        await expect(figure.locator('.react-flow__node').first()).toBeVisible();
        await figure.getByRole('button', { name: 'Next step' }).click();
        await expect(figure.getByText(/Step \d+ of \d+/)).toBeVisible();

        const results = await new AxeBuilder({ page })
            .include('figure:has(.react-flow)')
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();
        const blocking = results.violations.filter((violation) =>
            ['serious', 'critical'].includes(violation.impact ?? '')
        );
        expect(blocking.map((violation) => violation.id)).toEqual([]);
    });

    test('opens a diagram in full view and closes it with Escape', async ({
        page,
    }) => {
        await page.goto(flowArticles[0].path);
        await waitForHydration(page);
        const fullView = page
            .getByRole('button', { name: 'Full view' })
            .first();
        await fullView.scrollIntoViewIfNeeded();
        await fullView.click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('svg').first()).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
    });
});
