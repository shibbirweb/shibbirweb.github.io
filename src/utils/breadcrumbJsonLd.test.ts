import { describe, expect, it } from 'vitest';
import { siteURL } from '@/config/constants';
import { buildBreadcrumbJsonLd } from '@/utils/breadcrumbJsonLd';

describe('buildBreadcrumbJsonLd', () => {
    const breadcrumb = buildBreadcrumbJsonLd([
        { label: '~', href: '/', name: 'Home' },
        { label: 'articles', href: '/articles' },
        { label: 'my-post', href: '/articles/my-post', name: 'My Post' },
    ]);

    it('declares a schema.org BreadcrumbList', () => {
        expect(breadcrumb['@context']).toBe('https://schema.org');
        expect(breadcrumb['@type']).toBe('BreadcrumbList');
    });

    it('numbers the items from 1 in order', () => {
        const items = breadcrumb.itemListElement as unknown as Array<{
            position: number;
        }>;
        expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
    });

    it('prefers the human-readable name and falls back to the label', () => {
        const items = breadcrumb.itemListElement as unknown as Array<{
            name: string;
        }>;
        expect(items.map((item) => item.name)).toEqual([
            'Home',
            'articles',
            'My Post',
        ]);
    });

    it('makes every item URL absolute on the site origin', () => {
        const items = breadcrumb.itemListElement as unknown as Array<{
            item: string;
        }>;
        expect(items.map((item) => item.item)).toEqual([
            `${siteURL}/`,
            `${siteURL}/articles`,
            `${siteURL}/articles/my-post`,
        ]);
    });

    it('returns an empty list for no items', () => {
        expect(buildBreadcrumbJsonLd([]).itemListElement).toEqual([]);
    });
});
