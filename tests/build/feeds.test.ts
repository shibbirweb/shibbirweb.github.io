import { XMLParser } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import { siteURL } from '@/config/constants';
import { getAllArticles } from '@/lib/posts';
import { readOut, resolveRoute, toSitePath } from '@tests/build/helpers';

const parser = new XMLParser({ ignoreAttributes: false });
const publishedCount = getAllArticles().length;

function asList<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

describe('RSS feed (/feed.xml)', () => {
    const rss = parser.parse(readOut('feed.xml')).rss;
    const items = asList(rss.channel.item) as Record<string, unknown>[];

    it('is RSS 2.0 with channel details', () => {
        expect(rss['@_version']).toBe('2.0');
        expect(rss.channel.link).toBe(siteURL);
        expect(String(rss.channel.title).length).toBeGreaterThan(0);
    });

    it('has one item per published article', () => {
        expect(items).toHaveLength(publishedCount);
    });

    it('links every item to an exported article with full content', () => {
        for (const item of items) {
            expect(resolveRoute(toSitePath(String(item.link)))).not.toBeNull();
            expect(Number.isNaN(Date.parse(String(item.pubDate)))).toBe(false);
            expect(String(item['content:encoded']).length).toBeGreaterThan(100);
        }
    });
});

describe('Atom feed (/atom.xml)', () => {
    const feed = parser.parse(readOut('atom.xml')).feed;
    const entries = asList(feed.entry) as Record<string, unknown>[];

    it('has one entry per published article with valid dates', () => {
        expect(entries).toHaveLength(publishedCount);
        for (const entry of entries) {
            expect(Number.isNaN(Date.parse(String(entry.updated)))).toBe(false);
            expect(Number.isNaN(Date.parse(String(entry.published)))).toBe(
                false
            );
        }
    });
});

describe('JSON feed (/feed.json)', () => {
    const feed = JSON.parse(readOut('feed.json')) as {
        version: string;
        feed_url: string;
        items: {
            url: string;
            content_html: string;
            image?: string;
            date_published: string;
        }[];
    };

    it('follows JSON Feed 1.1', () => {
        expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
        expect(feed.feed_url).toBe(`${siteURL}/feed.json`);
    });

    it('has one item per published article with content and a PNG or raster image', () => {
        expect(feed.items).toHaveLength(publishedCount);
        for (const item of feed.items) {
            expect(resolveRoute(toSitePath(item.url))).not.toBeNull();
            expect(item.content_html.length).toBeGreaterThan(100);
            if (item.image) {
                expect(item.image).not.toMatch(/\.svg$/);
                expect(resolveRoute(toSitePath(item.image))).not.toBeNull();
            }
        }
    });
});
