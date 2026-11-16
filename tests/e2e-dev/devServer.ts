import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { expect, type Page } from '@playwright/test';

// Helpers for the dev-server specs (playwright.dev.config.ts). They read the
// content folder directly, because a dev run has no ./out to read the feed from.

export interface SourceArticle {
    slug: string;
    path: string;
    title: string;
}

/** Every published (non-draft) article in content/articles, by file order. */
export function sourceArticles(): SourceArticle[] {
    const directory = join(process.cwd(), 'content', 'articles');
    return readdirSync(directory)
        .filter((name) => /\.mdx?$/.test(name))
        .sort()
        .map((name) => {
            const { data } = matter(
                readFileSync(join(directory, name), 'utf8')
            );
            const slug = name.replace(/^\d+-/, '').replace(/\.mdx?$/, '');
            return {
                slug,
                path: `/articles/${slug}`,
                title: String(data.title ?? ''),
                draft: data.draft === true,
            };
        })
        .filter((article) => !article.draft)
        .map(({ slug, path, title }) => ({ slug, path, title }));
}

/**
 * Opens a route on the dev server and fails if it did not compile or render:
 * an error status, or Next's dev error dialog (a Turbopack build error or an
 * unhandled runtime error). Uncaught page errors are failed by the shared
 * fixture in tests/e2e/fixtures.ts.
 */
export async function openOnDevServer(
    page: Page,
    path: string,
    expectedStatus = 200
): Promise<void> {
    const response = await page.goto(path, { waitUntil: 'load' });

    expect(response?.status(), `HTTP status of ${path}`).toBe(expectedStatus);
    await expect(
        page.locator('[data-nextjs-dialog-content]'),
        `Next dev error dialog on ${path}`
    ).toHaveCount(0);
}
