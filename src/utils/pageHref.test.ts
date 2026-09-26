import { describe, expect, it } from 'vitest';
import { buildPageHref } from '@/utils/pageHref';

describe('buildPageHref', () => {
    it('adds the page param for pages after the first', () => {
        expect(buildPageHref('/articles', new URLSearchParams(), 3)).toBe(
            '/articles?page=3'
        );
    });

    it('keeps other query params intact', () => {
        const params = new URLSearchParams('tag=Git&q=cherry');
        expect(buildPageHref('/articles', params, 2)).toBe(
            '/articles?tag=Git&q=cherry&page=2'
        );
    });

    it('replaces an existing page param rather than duplicating it', () => {
        const params = new URLSearchParams('page=2&tag=Git');
        expect(buildPageHref('/articles', params, 4)).toBe(
            '/articles?page=4&tag=Git'
        );
    });

    it('drops the page param on page 1 so the URL stays canonical', () => {
        const params = new URLSearchParams('page=3');
        expect(buildPageHref('/articles', params, 1)).toBe('/articles');
    });

    it('drops only the page param on page 1 and keeps the rest', () => {
        const params = new URLSearchParams('tag=Git&page=3');
        expect(buildPageHref('/articles', params, 1)).toBe('/articles?tag=Git');
    });

    it('treats page 0 or below as the first page', () => {
        expect(
            buildPageHref('/articles', new URLSearchParams('page=2'), 0)
        ).toBe('/articles');
    });

    it('does not mutate the params it was given', () => {
        const params = new URLSearchParams('tag=Git');
        buildPageHref('/articles', params, 5);
        expect(params.toString()).toBe('tag=Git');
    });
});
