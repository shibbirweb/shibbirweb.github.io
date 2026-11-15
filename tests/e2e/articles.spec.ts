import { ARTICLES_PER_PAGE } from '@/lib/posts';
import { ARTICLES_VIEW_STORAGE_KEY } from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import {
    expect,
    publishedArticles,
    test,
    waitForHydration,
} from '@tests/e2e/fixtures';
import type { Page } from '@playwright/test';

const articles = publishedArticles();

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

    test('filters by tag and resets with "All"', async ({ page }) => {
        await page.goto('/articles');
        const firstTag = page.locator('main a[href^="/articles?tag="]').first();
        const tagHref = (await firstTag.getAttribute('href'))!;
        const tag = new URLSearchParams(tagHref.split('?')[1]).get('tag')!;

        await firstTag.click();
        await expect(page).toHaveURL(
            new RegExp(
                `\\?tag=${encodeURIComponent(tag).replace(/%20/g, '(\\+|%20)')}`
            )
        );
        const cards = page.locator('main li:has(a[href^="/articles/"])');
        await expect(cards.first()).toBeVisible();
        for (const card of await cards.all()) {
            await expect(
                card.locator(`a[href^="/articles?tag="]`, { hasText: tag })
            ).toHaveCount(1);
        }

        await page.getByRole('link', { name: 'All', exact: true }).click();
        await expect(page).toHaveURL(/\/articles$/);
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

    test('opens in the card grid by default', async ({ page }) => {
        await page.goto('/articles');
        await waitForHydration(page);

        await expect(layoutButton(page, 'Grid view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        await expect(coverImages(page)).toHaveCount(await items(page).count());
    });

    test('switches to the list and keeps it across reloads, tags and search', async ({
        page,
    }) => {
        await page.goto('/articles');
        await waitForHydration(page);

        await layoutButton(page, 'List view').click();
        await expect(layoutButton(page, 'List view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        await expect(coverImages(page)).toHaveCount(0);
        await expect(items(page).first().locator('time')).toBeVisible();

        await page.reload();
        await waitForHydration(page);
        await expect(layoutButton(page, 'List view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        await expect(coverImages(page)).toHaveCount(0);

        await page
            .locator('main nav a[href^="/articles?tag="]')
            .first()
            .click();
        await expect(page).toHaveURL(/\?tag=/);
        await expect(items(page).first()).toBeVisible();
        await expect(coverImages(page)).toHaveCount(0);

        await page.goto('/articles/search?q=a');
        await waitForHydration(page);
        await expect(layoutButton(page, 'List view')).toHaveAttribute(
            'aria-pressed',
            'true'
        );
        await expect(coverImages(page)).toHaveCount(0);
    });

    test('switches back to the grid', async ({ page }) => {
        await page.addInitScript(
            (key) => window.localStorage.setItem(key, 'list'),
            ARTICLES_VIEW_STORAGE_KEY
        );
        await page.goto('/articles');
        await waitForHydration(page);

        await layoutButton(page, 'Grid view').click();

        await expect(coverImages(page)).toHaveCount(await items(page).count());
        expect(
            await page.evaluate(
                (key) => window.localStorage.getItem(key),
                ARTICLES_VIEW_STORAGE_KEY
            )
        ).toBe('grid');
    });

    // The pre-rendered HTML is always the grid. With the app's scripts held
    // back, this is the moment before React takes over: a saved list must keep
    // that grid hidden (no flash), while everyone else sees it.
    test('never flashes the grid at a visitor who saved the list', async ({
        page,
    }) => {
        await page.addInitScript(
            (key) => window.localStorage.setItem(key, 'list'),
            ARTICLES_VIEW_STORAGE_KEY
        );
        await page.route('**/_next/static/chunks/**', (route) => route.abort());
        await page.goto('/articles');

        await expect(page.locator('html')).toHaveAttribute(
            'data-articles-view',
            'list'
        );
        await expect(items(page).first()).toBeHidden();
        await expect(
            page.getByRole('navigation', { name: 'Filter articles by tag' })
        ).toBeVisible();
    });

    test('shows the pre-rendered grid when nothing is saved', async ({
        page,
    }) => {
        await page.route('**/_next/static/chunks/**', (route) => route.abort());
        await page.goto('/articles');

        await expect(page.locator('html')).not.toHaveAttribute(
            'data-articles-view',
            /.+/
        );
        await expect(items(page).first()).toBeVisible();
    });
});
