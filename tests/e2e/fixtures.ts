import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test as base, expect, type Page } from '@playwright/test';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

// Uncaught errors from a blocked third-party script are not our bug.
const IGNORED_PAGE_ERRORS = [/hcaptcha/i, /giscus/i, /googletagmanager/i];

interface Fixtures {
    blockThirdParties: void;
    emulateNoServiceWorker: void;
    failOnPageErrors: void;
}

/**
 * The base test for every browser spec. It blocks all third-party requests
 * (GTM, giscus, hCaptcha, Web3Forms) so tests are fast, offline-safe and never
 * send real analytics or messages; a spec that needs one mocks it with
 * page.route, which takes priority over this context-level block. It also fails
 * the test on any uncaught page error, so a feature that crashes in the
 * browser cannot pass silently.
 */
export const test = base.extend<Fixtures>({
    blockThirdParties: [
        async ({ context }, use) => {
            await context.route(
                (url) => !LOCAL_HOSTS.has(url.hostname),
                (route) => route.abort('blockedbyclient')
            );
            await use();
        },
        { auto: true },
    ],
    // Playwright's "block" mode keeps navigator.serviceWorker but resolves
    // register() with undefined, which no real browser does. Removing the API
    // instead matches a real browser without service worker support (for
    // example a private window), so specs also cover that path.
    emulateNoServiceWorker: [
        async ({ context, serviceWorkers }, use) => {
            if (serviceWorkers === 'block') {
                await context.addInitScript(() => {
                    delete (Navigator.prototype as { serviceWorker?: unknown })
                        .serviceWorker;
                });
            }
            await use();
        },
        { auto: true },
    ],
    failOnPageErrors: [
        async ({ page }, use) => {
            const errors: string[] = [];
            page.on('pageerror', (error) => {
                const message = `${error.message}\n${error.stack ?? ''}`;
                if (
                    !IGNORED_PAGE_ERRORS.some((pattern) =>
                        pattern.test(message)
                    )
                ) {
                    errors.push(error.message);
                }
            });
            await use();
            expect(errors, 'uncaught errors in the page').toEqual([]);
        },
        { auto: true },
    ],
});

export { expect };

export interface PublishedArticle {
    slug: string;
    path: string;
    title: string;
}

/** Published articles, read from the exported JSON feed. */
export function publishedArticles(): PublishedArticle[] {
    const feed = JSON.parse(
        readFileSync(join(process.cwd(), 'out', 'feed.json'), 'utf8')
    ) as { items: { url: string; title: string }[] };
    return feed.items.map((item) => {
        const path = new URL(item.url).pathname;
        return {
            slug: path.replace(/^\/articles\//, ''),
            path,
            title: item.title,
        };
    });
}

/** The raw markdown of a published article, for picking feature fixtures. */
export function articleSource(slug: string): string {
    const directory = join(process.cwd(), 'content', 'articles');
    const fileName = readdirSync(directory).find(
        (name) => name.replace(/^\d+-/, '').replace(/\.mdx?$/, '') === slug
    );
    return fileName ? readFileSync(join(directory, fileName), 'utf8') : '';
}

/** Articles whose body contains the given fenced block language. */
export function articlesWithFence(language: string): PublishedArticle[] {
    return publishedArticles().filter((article) =>
        articleSource(article.slug).includes(`\`\`\`${language}`)
    );
}

/**
 * Waits until client islands (diagrams, copy buttons) have mounted: the page
 * has loaded, every diagram's source <pre> has been swapped for its rendered
 * host, and the browser has had an idle moment to finish effects. This avoids
 * 'networkidle', which never settles on pages that poll (network status).
 */
export async function waitForHydration(page: Page): Promise<void> {
    await page.waitForLoadState('load');
    await page.waitForFunction(() =>
        [...document.querySelectorAll('pre.mermaid, pre.reactflow')].every(
            (block) => (block as HTMLElement).style.display === 'none'
        )
    );
    // While mermaid loads, each diagram shows its source in a fallback <pre>
    // (CSS Module classes `..._fallback__` / `..._staticFallback__`); wait for
    // every one to be replaced by its SVG.
    await page.waitForFunction(
        () =>
            document.querySelectorAll(
                '[class*="_fallback__"], [class*="_staticFallback__"]'
            ).length === 0
    );
    await page.evaluate(
        () =>
            new Promise<void>((resolve) => {
                requestIdleCallback(() => resolve(), { timeout: 2_000 });
            })
    );
}
