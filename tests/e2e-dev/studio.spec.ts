import { expect, test } from '@tests/e2e/fixtures';
import { openOnDevServer, sourceArticles } from '@tests/e2e-dev/devServer';

// The article editor studio exists only under `next dev` (its files end in
// .dev.tsx), so no other suite ever loads it. These specs cover the paths that
// have broken before: the route compiling at all, the live preview rendering
// Markdown in the browser, and the Server Actions that read article files.

const EDITOR_PATH = '/studio/article-editor';

test.describe('article editor studio', () => {
    test('the editor page compiles and renders', async ({ page }) => {
        await openOnDevServer(page, EDITOR_PATH);

        await expect(
            page.getByRole('heading', { level: 1, name: 'Article Editor' })
        ).toBeVisible();
    });

    test('the live preview renders typed Markdown in the browser', async ({
        page,
    }) => {
        await openOnDevServer(page, EDITOR_PATH);

        await page
            .getByRole('textbox', { name: 'Article Markdown' })
            .fill('## Preview smoke test\n\nSome **bold** text.');

        await expect(
            page.getByRole('heading', { level: 2, name: 'Preview smoke test' })
        ).toBeVisible();
        await expect(page.locator('strong', { hasText: 'bold' })).toBeVisible();
    });

    test('opening an existing article loads it through the Server Actions', async ({
        page,
    }) => {
        const [article] = sourceArticles();
        await openOnDevServer(page, EDITOR_PATH);

        await page
            .getByRole('combobox', { name: 'Open article' })
            .selectOption({ label: article.title });

        await expect(page.getByRole('textbox', { name: /^Title/ })).toHaveValue(
            article.title
        );
    });

    test('the full preview route renders an article', async ({ page }) => {
        const [article] = sourceArticles();

        await openOnDevServer(page, `${EDITOR_PATH}/preview/${article.slug}`);

        await expect(
            page.getByRole('heading', { level: 1, name: article.title })
        ).toBeVisible();
    });
});
