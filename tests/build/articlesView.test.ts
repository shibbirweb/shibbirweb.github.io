import { describe, expect, it } from 'vitest';
import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import {
    listHtmlPages,
    loadPage,
    readAssetByUrl,
    stylesheetUrls,
} from '@tests/build/helpers';

// The articles list/grid choice lives in the visitor's browser, so the static
// HTML must always ship the default list, plus what lets a saved grid apply
// before first paint: the inline script in <head> and the CSS rule that hides
// the pre-rendered list while the grid loads.

function articlesPage() {
    return loadPage('articles.html');
}

describe('articles layout toggle in the static export', () => {
    it('ships the layout toggle with the list pressed, list first', () => {
        const document = articlesPage();
        const toggle = document.querySelector(
            '[role="group"][aria-label="Layout"]'
        );
        const pressed = [...(toggle?.querySelectorAll('button') ?? [])].map(
            (button) => [
                button.getAttribute('aria-label'),
                button.getAttribute('aria-pressed'),
            ]
        );

        expect(pressed).toEqual([
            ['List view', 'true'],
            ['Grid view', 'false'],
        ]);
    });

    it('pre-renders the first page as rows inside the hideable wrapper', () => {
        const document = articlesPage();
        const toggle = document.querySelector(
            '[role="group"][aria-label="Layout"]'
        );
        const wrapper = toggle?.closest('[class*="pendingResults"]');
        const rows =
            wrapper?.querySelectorAll('li[data-spotlight-surface]') ?? [];

        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
            expect(row.querySelector('img')).toBeNull();
            expect(row.querySelector('time')).not.toBeNull();
        }
        expect(
            wrapper?.querySelector('nav[aria-label="Filter articles by tag"]')
        ).toBeNull();
    });

    it('counts the articles in the toolbar', () => {
        const document = articlesPage();
        const toggle = document.querySelector(
            '[role="group"][aria-label="Layout"]'
        );

        expect(toggle?.parentElement?.parentElement?.textContent).toMatch(
            /\d+ articles?/
        );
    });

    it.each(listHtmlPages().filter((page) => page !== 'offline-fallback.html'))(
        '%s applies a saved layout in <head> before first paint',
        (page) => {
            const scripts = [
                ...loadPage(page).head.querySelectorAll('script:not([src])'),
            ].map((script) => script.textContent ?? '');

            expect(
                scripts.some(
                    (source) =>
                        source.includes(ARTICLES_VIEW_STORAGE_KEY) &&
                        source.includes(ARTICLES_VIEW_ATTRIBUTE)
                )
            ).toBe(true);
        }
    );

    it('ships the rule that hides the pre-rendered list for a saved grid', () => {
        const css = stylesheetUrls('articles.html')
            .map((url) => readAssetByUrl(url).toString('utf8'))
            .join('\n');

        expect(css).toMatch(
            /html\[data-articles-view=['"]?grid['"]?\][^{]*\{[^}]*visibility:\s*hidden/
        );
    });

    // The default list has no cover images, so nothing on the index waits for a
    // large image before the first paint.
    it('ships no cover images in the default list', () => {
        expect(
            articlesPage().querySelectorAll(
                'main li[data-spotlight-surface] img'
            )
        ).toHaveLength(0);
    });

    it('ships the series page rules that show the saved layout', () => {
        const css = stylesheetUrls('articles/series.html')
            .map((url) => readAssetByUrl(url).toString('utf8'))
            .join('\n');

        expect(css).toMatch(/html\[data-articles-view=['"]?grid['"]?\]/);
    });

    // In the series grid the front cover of each first-row deck is the largest
    // paint, so it loads eagerly; the covers behind it stay lazy.
    it('loads only the front cover of each first-row series deck eagerly', () => {
        const decks = loadPage('articles/series.html').querySelectorAll(
            'ul[class*="gridView"] li[data-spotlight-surface] [aria-hidden="true"]:has(img)'
        );
        const [firstDeck] = [...decks];
        const loading = [...(firstDeck?.querySelectorAll('img') ?? [])].map(
            (image) => image.getAttribute('loading')
        );

        expect(loading[0]).toBe('eager');
        expect(loading.slice(1)).not.toContain('eager');
    });
});
