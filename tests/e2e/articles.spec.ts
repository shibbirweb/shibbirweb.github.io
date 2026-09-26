import { ARTICLES_PER_PAGE } from '@/lib/posts';
import { expect, publishedArticles, test } from '@tests/e2e/fixtures';

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
