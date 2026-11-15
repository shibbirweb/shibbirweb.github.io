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

// The articles grid/list choice lives in the visitor's browser, so the static
// HTML must always ship the default grid, plus what lets a saved list apply
// before first paint: the inline script in <head> and the CSS rule that hides
// the pre-rendered grid while the list loads.

function articlesPage() {
    return loadPage('articles.html');
}

describe('articles layout toggle in the static export', () => {
    it('ships the layout toggle with the grid pressed', () => {
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
            ['Grid view', 'true'],
            ['List view', 'false'],
        ]);
    });

    it('pre-renders the first page as the card grid inside the hideable wrapper', () => {
        const document = articlesPage();
        const toggle = document.querySelector(
            '[role="group"][aria-label="Layout"]'
        );
        const wrapper = toggle?.parentElement?.parentElement;
        const cards =
            wrapper?.querySelectorAll('li[data-spotlight-surface]') ?? [];

        expect(cards.length).toBeGreaterThan(0);
        for (const card of cards) {
            expect(card.querySelector('img')).not.toBeNull();
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

        expect(toggle?.parentElement?.textContent).toMatch(/\d+ articles?/);
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

    it('ships the rule that hides the pre-rendered grid for a saved list', () => {
        const css = stylesheetUrls('articles.html')
            .map((url) => readAssetByUrl(url).toString('utf8'))
            .join('\n');

        expect(css).toMatch(
            /html\[data-articles-view=['"]?list['"]?\][^{]*\{[^}]*visibility:\s*hidden/
        );
    });
});
