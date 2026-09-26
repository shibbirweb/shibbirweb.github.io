import { publishedArticles } from '@tests/e2e/fixtures';

/** Every page a visitor can reach, used by the layout and a11y sweeps. */
export function siteRoutes(): string[] {
    const [newestArticle] = publishedArticles();
    return [
        '/',
        '/articles',
        ...(newestArticle ? [newestArticle.path] : []),
        '/articles/search?q=git',
        '/resume',
        '/now',
        '/uses',
        '/network-status',
        '/this-page-does-not-exist',
    ];
}
