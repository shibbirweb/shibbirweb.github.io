import { publishedArticles } from '@tests/e2e/fixtures';

/**
 * The fixed pages of the site. Shared with the dev-server sweep
 * (tests/e2e-dev/pages.spec.ts), so a new page is covered by both suites.
 */
export const STATIC_PAGES = [
    '/',
    '/articles',
    '/articles/series',
    '/articles/search?q=git',
    '/resume',
    '/now',
    '/uses',
    '/network-status',
];

/** Every page a visitor can reach, used by the layout and a11y sweeps. */
export function siteRoutes(): string[] {
    const [newestArticle] = publishedArticles();
    return [
        ...STATIC_PAGES,
        ...(newestArticle ? [newestArticle.path] : []),
        '/this-page-does-not-exist',
    ];
}
