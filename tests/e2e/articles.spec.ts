import { ARTICLES_PER_PAGE, getAllArticles } from '@/lib/posts';
import { buildSeriesShelf } from '@/utils/seriesShelf';
import { ARTICLES_VIEW_STORAGE_KEY } from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import {
    expect,
    publishedArticles,
    test,
    waitForHydration,
} from '@tests/e2e/fixtures';
import type { Page } from '@playwright/test';

const articles = publishedArticles();
const seriesShelf = buildSeriesShelf(getAllArticles());

test.describe('articles index', () => {
    test.skip(articles.length === 0, 'no published articles');

    test('lists the newest articles on the first page', async ({ page }) => {
        await page.goto('/articles');
        const main = page.locator('main');

        for (const article of articles.slice(0, ARTICLES_PER_PAGE)) {
            await expect(
                main.locator(`a[href="${article.path}"]`).first()
            ).toBeAttached();
        }
    });

    test('folds the topics behind Filters until asked', async ({ page }) => {
        await page.goto('/articles');
        await waitForHydration(page);
        const filters = page.getByRole('button', { name: 'Filters' });
        const topics = page.getByRole('navigation', {
            name: 'Filter articles by tag',
        });

        await expect(filters).toHaveAttribute('aria-expanded', 'false');
        await expect(topics).toBeHidden();

        await filters.click();
        await expect(topics).toBeVisible();
        await expect(topics.getByRole('link').first()).toHaveAccessibleName(
            /^All \(\d+ articles?\)$/
        );

        await filters.click();
        await expect(topics).toBeHidden();
    });

    test('filters by a topic and resets with "All"', async ({ page }) => {
        await page.goto('/articles');
        await waitForHydration(page);
        await page.getByRole('button', { name: 'Filters' }).click();
        const topics = page.getByRole('navigation', {
            name: 'Filter articles by tag',
        });
        const firstTopic = topics.locator('a[href^="/articles?tag="]').first();
        const tagHref = (await firstTopic.getAttribute('href'))!;
        const tag = new URLSearchParams(tagHref.split('?')[1]).get('tag')!;

        await firstTopic.click();
        await expect(page).toHaveURL(
            new RegExp(
                `\\?tag=${encodeURIComponent(tag).replace(/%20/g, '(\\+|%20)')}`
            )
        );
        const tagged = getAllArticles().filter((article) =>
            article.tags.includes(tag)
        );
        const rows = page.locator('main li[data-spotlight-surface]');
        await expect(rows).toHaveCount(
            Math.min(tagged.length, ARTICLES_PER_PAGE)
        );
        for (const article of tagged.slice(0, ARTICLES_PER_PAGE)) {
            await expect(
                rows.locator(`a[href="/articles/${article.slug}"]`)
            ).toHaveCount(1);
        }
        await expect(
            topics.getByRole('link', { name: /clear filter/ })
        ).toHaveAttribute('aria-current', 'page');

        await topics.getByRole('link', { name: /^All / }).click();
        await expect(page).toHaveURL(/\/articles$/);
    });

    test('names an applied topic beside Filters and clears it', async ({
        page,
    }) => {
        const [tag] = getAllArticles()[0].tags;
        await page.goto(`/articles?tag=${encodeURIComponent(tag)}`);
        await waitForHydration(page);

        await page.getByRole('button', { name: 'Filters, 1 applied' }).click();
        const chip = page.getByRole('link', {
            name: `Topic: ${tag}, clear filter`,
        });
        await expect(chip).toBeVisible();

        await chip.click();
        await expect(page).toHaveURL(/\/articles$/);
    });

    test('points to the latest series and to every series', async ({
        page,
    }) => {
        test.skip(seriesShelf.length === 0, 'no series published');
        const [latest] = seriesShelf;
        await page.goto('/articles');

        await expect(
            page.getByRole('link', { name: new RegExp(`^${latest.name},`) })
        ).toHaveAttribute('href', `/articles/${latest.parts[0].slug}`);

        await page.getByRole('link', { name: /^All series/ }).click();
        await expect(page).toHaveURL(/\/articles\/series$/);
    });
});

test.describe('article search', () => {
    test.skip(articles.length === 0, 'no published articles');
    const [newest] = articles;
    const query = newest?.title.split(' ').slice(0, 3).join(' ') ?? '';

    test('opens with the keyboard shortcut and jumps to a match', async ({
        page,
        isMobile,
    }) => {
        test.skip(isMobile, 'no hardware keyboard shortcut on phones');
        await page.goto('/articles');
        await page.locator('main').click({ position: { x: 5, y: 5 } });
        await page.keyboard.press('Control+k');

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.getByRole('combobox').fill(query);
        // The first option is the best match; the last one is "Search for ...".
        await expect(dialog.getByRole('option').first()).toContainText(
            newest.title.slice(0, 20)
        );
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await expect(page).toHaveURL(new RegExp(`${newest.path}$`));
    });

    test('opens from the search button and closes with Escape', async ({
        page,
    }) => {
        await page.goto('/articles');
        await page.getByRole('button', { name: 'Search articles' }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
    });

    test('shows results on the search page', async ({ page }) => {
        await page.goto(`/articles/search?q=${encodeURIComponent(query)}`);

        await expect(
            page.locator(`main a[href="${newest.path}"]`).first()
        ).toBeVisible();
    });

    test('leads back to every article with "Clear search"', async ({
        page,
    }) => {
        await page.goto(`/articles/search?q=${encodeURIComponent(query)}`);
        await waitForHydration(page);

        await page.getByRole('link', { name: 'Clear search' }).click();
        await expect(page).toHaveURL(/\/articles$/);
    });

    test('says so when nothing matches', async ({ page }) => {
        await page.goto('/articles/search?q=zzqxwvnothingmatches');

        await expect(page.locator(`main a[href^="/articles/"]`)).toHaveCount(0);
    });
});

test.describe('articles layout', () => {
    test.skip(articles.length === 0, 'no published articles');

    // Grid cards carry the cover image; list rows replace it with a date tile.
    const items = (page: Page) =>
        page.locator('main li[data-spotlight-surface]');
    const coverImages = (page: Page) =>
        page.locator('main li[data-spotlight-surface] img');
    const layoutButton = (page: Page, name: 'Grid view' | 'List view') =>
        page
            .getByRole('group', { name: 'Layout' })
            .getByRole('button', { name });

    test('opens in the row list by default', async ({ page }) => {
        await page.goto('/articles');
        await waitForHydration(page);

        await expect(layoutButton(page, 'List view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        await expect(items(page).first().locator('time')).toBeVisible();
        await expect(coverImages(page)).toHaveCount(0);
    });

    test('switches to the grid and keeps it across reloads, topics, search and series', async ({
        page,
    }) => {
        await page.goto('/articles');
        await waitForHydration(page);

        await layoutButton(page, 'Grid view').click();
        await expect(layoutButton(page, 'Grid view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        await expect(coverImages(page)).toHaveCount(await items(page).count());

        await page.reload();
        await waitForHydration(page);
        await expect(layoutButton(page, 'Grid view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );

        await page
            .locator(
                'main li[data-spotlight-surface] a[href^="/articles?tag="]'
            )
            .first()
            .click();
        await expect(page).toHaveURL(/\?tag=/);
        await expect(items(page).first()).toBeVisible();
        await expect(coverImages(page)).toHaveCount(await items(page).count());

        await page.goto('/articles/search?q=a');
        await waitForHydration(page);
        await expect(layoutButton(page, 'Grid view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        await expect(coverImages(page)).toHaveCount(await items(page).count());

        await page.goto('/articles/series');
        await waitForHydration(page);
        await expect(layoutButton(page, 'Grid view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
    });

    test('switches back to the list', async ({ page }) => {
        await page.addInitScript(
            (key) => window.localStorage.setItem(key, 'grid'),
            ARTICLES_VIEW_STORAGE_KEY
        );
        await page.goto('/articles');
        await waitForHydration(page);

        await layoutButton(page, 'List view').click();

        await expect(coverImages(page)).toHaveCount(0);
        expect(
            await page.evaluate(
                (key) => window.localStorage.getItem(key),
                ARTICLES_VIEW_STORAGE_KEY
            )
        ).toBe('list');
    });

    // The pre-rendered HTML is always the list. With the app's scripts held
    // back, this is the moment before React takes over: a saved grid must keep
    // that list hidden (no flash), while everyone else sees it.
    test('never flashes the list at a visitor who saved the grid', async ({
        page,
    }) => {
        await page.addInitScript(
            (key) => window.localStorage.setItem(key, 'grid'),
            ARTICLES_VIEW_STORAGE_KEY
        );
        await page.route('**/_next/static/chunks/**', (route) => route.abort());
        await page.goto('/articles');

        await expect(page.locator('html')).toHaveAttribute(
            'data-articles-view',
            'grid'
        );
        await expect(items(page).first()).toBeHidden();
        await expect(
            page.getByRole('button', { name: 'Filters' })
        ).toBeVisible();
    });

    test('shows the pre-rendered list when nothing is saved', async ({
        page,
    }) => {
        await page.route('**/_next/static/chunks/**', (route) => route.abort());
        await page.goto('/articles');

        await expect(page.locator('html')).not.toHaveAttribute(
            'data-articles-view',
            /.+/
        );
        await expect(items(page).first()).toBeVisible();
        await expect(coverImages(page)).toHaveCount(0);
    });
});
