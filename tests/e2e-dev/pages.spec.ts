import { test } from '@tests/e2e/fixtures';
import { openOnDevServer, sourceArticles } from '@tests/e2e-dev/devServer';
import { STATIC_PAGES } from '@tests/e2e/routes';

// Every public page compiles and renders under `next dev` (Turbopack). The
// static export is built with webpack, so a Turbopack-only break would
// otherwise only show up when the maintainer next runs `pnpm dev`.

test.describe('public pages on the dev server', () => {
    for (const path of STATIC_PAGES) {
        test(`${path} renders without errors`, async ({ page }) => {
            await openOnDevServer(page, path);
        });
    }

    for (const article of sourceArticles()) {
        test(`article ${article.slug} renders without errors`, async ({
            page,
        }) => {
            await openOnDevServer(page, article.path);
        });
    }

    test('an unknown page answers 404 with the not-found page', async ({
        page,
    }) => {
        await openOnDevServer(page, '/this-page-does-not-exist', 404);
    });
});
