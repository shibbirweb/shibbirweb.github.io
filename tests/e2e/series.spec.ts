import { getAllArticlesWithStack } from '@/lib/posts';
import { buildSeriesShelf } from '@/utils/seriesShelf';
import { ARTICLES_VIEW_STORAGE_KEY } from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import { expect, test, waitForHydration } from '@tests/e2e/fixtures';
import type { Page } from '@playwright/test';

const series = buildSeriesShelf(getAllArticlesWithStack());

// The page ships both layouts and CSS shows one, so only visible entries count.
const visibleSeriesHeadings = (page: Page) => page.locator('main h2:visible');

test.describe('series page', () => {
    test.skip(series.length === 0, 'no series published');
    const [latest] = series;

    test('lists every series as rows by default, newest first', async ({
        page,
    }) => {
        await page.goto('/articles/series');
        await waitForHydration(page);

        await expect(visibleSeriesHeadings(page)).toHaveText(
            series.map((entry) => entry.name)
        );
        await expect(
            page
                .getByRole('group', { name: 'Layout' })
                .getByRole('button', { name: 'List view' })
        ).toHaveAttribute('aria-pressed', 'true');
    });

    test('starts the latest series at part 1', async ({ page }) => {
        await page.goto('/articles/series');
        await waitForHydration(page);

        await page
            .getByRole('link', { name: `Start with part 1 of ${latest.name}` })
            .filter({ visible: true })
            .click();

        await expect(page).toHaveURL(
            new RegExp(`/articles/${latest.parts[0].slug}$`)
        );
    });

    test('filters by a topic from the Filters panel', async ({ page }) => {
        const [tag] = latest.tags;
        await page.goto('/articles/series');
        await waitForHydration(page);

        await page.getByRole('button', { name: 'Filters' }).click();
        await page
            .getByRole('navigation', { name: 'Filter series by tag' })
            .getByRole('link', { name: new RegExp(`^${tag} \\(`) })
            .click();

        await expect(page).toHaveURL(
            new RegExp(`/articles/series\\?tag=${encodeURIComponent(tag)}$`)
        );
        await expect(visibleSeriesHeadings(page)).toHaveText(
            series
                .filter((entry) => entry.tags.includes(tag))
                .map((entry) => entry.name)
        );
    });

    test('says so when no series covers the topic', async ({ page }) => {
        await page.goto('/articles/series?tag=zzqxwv-no-such-topic');
        await waitForHydration(page);

        await expect(
            page.getByText('No series found for this topic.')
        ).toBeVisible();
    });

    test('shows the cover deck, tags and stack in the grid', async ({
        page,
    }) => {
        await page.addInitScript(
            (key) => window.localStorage.setItem(key, 'grid'),
            ARTICLES_VIEW_STORAGE_KEY
        );
        await page.goto('/articles/series');
        await waitForHydration(page);

        const card = page
            .locator('main li[data-spotlight-surface]')
            .filter({ visible: true })
            .first();
        await expect(card.locator('img')).toHaveCount(
            Math.min(latest.parts.length, 3)
        );
        await expect(
            card.locator(
                `a[href="/articles/series?tag=${encodeURIComponent(latest.tags[0])}"]`
            )
        ).toBeVisible();
        if (latest.tech.length > 0) {
            await expect(card.getByText('Stack')).toBeVisible();
        }
    });

    // Both layouts are in the static HTML. With the app's scripts held back, a
    // saved grid must already hide the default list before React takes over.
    test('never flashes the list at a visitor who saved the grid', async ({
        page,
    }) => {
        await page.addInitScript(
            (key) => window.localStorage.setItem(key, 'grid'),
            ARTICLES_VIEW_STORAGE_KEY
        );
        await page.route('**/_next/static/chunks/**', (route) => route.abort());
        await page.goto('/articles/series');

        const rows = page.locator('main ul[class*="listView"]');
        const cards = page.locator('main ul[class*="gridView"]');
        await expect(rows).toBeHidden();
        await expect(cards).toBeVisible();
    });

    test('shows the list without scripts when nothing is saved', async ({
        page,
    }) => {
        await page.route('**/_next/static/chunks/**', (route) => route.abort());
        await page.goto('/articles/series');

        await expect(page.locator('main ul[class*="listView"]')).toBeVisible();
        await expect(page.locator('main ul[class*="gridView"]')).toBeHidden();
    });
});
