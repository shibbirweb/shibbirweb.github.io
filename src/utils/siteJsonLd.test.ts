import { describe, expect, it } from 'vitest';
import { siteName, siteURL } from '@/config/constants';
import { studioItems } from '@/components/layout/Navbar/contents';
import { siteNavigationJsonLd, websiteJsonLd } from '@/utils/siteJsonLd';

type NavigationEntry = { position: number; name: string; url: string };

const navigationEntries =
    siteNavigationJsonLd.itemListElement as unknown as NavigationEntry[];

describe('websiteJsonLd', () => {
    it('is a WebSite entity at the site URL', () => {
        expect(websiteJsonLd['@type']).toBe('WebSite');
        expect(websiteJsonLd['@id']).toBe(`${siteURL}#website`);
        expect(websiteJsonLd.url).toBe(siteURL);
        expect(websiteJsonLd.name).toBe(siteName);
    });

    it('names the site Person as its publisher', () => {
        expect(websiteJsonLd.publisher).toEqual({ '@id': `${siteURL}#person` });
    });
});

describe('siteNavigationJsonLd', () => {
    it('is an ItemList of SiteNavigationElements numbered from 1', () => {
        expect(siteNavigationJsonLd['@type']).toBe('ItemList');
        expect(navigationEntries.map((entry) => entry.position)).toEqual(
            navigationEntries.map((_, index) => index + 1)
        );
    });

    it('lists the primary navigation in navbar order', () => {
        expect(navigationEntries.map((entry) => entry.name)).toEqual([
            'About',
            'Skills',
            'Projects',
            'Contact',
            'Articles',
            'Uses',
            'Now',
            'Resume',
        ]);
    });

    it('makes every navigation URL absolute on the site origin', () => {
        for (const entry of navigationEntries) {
            expect(entry.url.startsWith(`${siteURL}/`)).toBe(true);
        }
        expect(navigationEntries[0].url).toBe(`${siteURL}/#about`);
    });

    it('excludes the dev-only studio items', () => {
        const names = navigationEntries.map((entry) => entry.name);
        const urls = navigationEntries.map((entry) => entry.url);
        for (const studioItem of studioItems) {
            expect(names).not.toContain(studioItem.label);
            expect(urls).not.toContain(`${siteURL}${studioItem.href}`);
        }
        expect(urls.some((url) => url.includes('/studio'))).toBe(false);
    });
});
