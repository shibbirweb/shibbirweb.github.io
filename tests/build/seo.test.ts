import { XMLParser } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import { siteURL } from '@/config/constants';
import { getAllArticles } from '@/lib/posts';
import {
    jsonLdBlocks,
    listHtmlPages,
    loadPage,
    pagePath,
    readOut,
    resolveRoute,
    toSitePath,
} from '@tests/build/helpers';

// Pages that should never be indexed by search engines.
const NOINDEX_PAGES = ['articles/search.html', 'network-status.html'];
// Pages with no meaningful canonical/OG setup (error and offline shells).
const SHELL_PAGES = ['404.html', 'offline-fallback.html'];
const indexablePages = listHtmlPages().filter(
    (page) => !NOINDEX_PAGES.includes(page) && !SHELL_PAGES.includes(page)
);

function metaContent(document: Document, selector: string): string | null {
    return document.querySelector(selector)?.getAttribute('content') ?? null;
}

function jsonLdTypes(page: string): string[] {
    return jsonLdBlocks(page).flatMap((block) => {
        const type = block['@type'];
        return Array.isArray(type) ? type : [String(type)];
    });
}

describe('page metadata', () => {
    it.each(listHtmlPages())('%s has lang, a title and one h1', (page) => {
        const document = loadPage(page);

        expect(document.documentElement.getAttribute('lang')).toBe('en');
        expect(document.title.trim().length).toBeGreaterThan(0);
        expect(document.querySelectorAll('h1')).toHaveLength(1);
    });

    it.each(indexablePages)(
        '%s has description, canonical and OG tags',
        (page) => {
            const document = loadPage(page);
            const canonical = document
                .querySelector('link[rel="canonical"]')
                ?.getAttribute('href');

            expect(
                metaContent(document, 'meta[name="description"]')?.length
            ).toBeGreaterThan(20);
            expect(canonical).toBe(
                pagePath(page) === '/' ? siteURL : `${siteURL}${pagePath(page)}`
            );
            expect(
                metaContent(document, 'meta[property="og:title"]')
            ).toBeTruthy();
            expect(metaContent(document, 'meta[name="twitter:card"]')).toBe(
                'summary_large_image'
            );
        }
    );

    it.each(indexablePages)(
        '%s points og:image at an exported file',
        (page) => {
            const image = metaContent(
                loadPage(page),
                'meta[property="og:image"]'
            );

            expect(image).toMatch(/^https:\/\//);
            expect(resolveRoute(toSitePath(image!))).not.toBeNull();
        }
    );

    it.each(NOINDEX_PAGES)('%s asks search engines not to index it', (page) => {
        expect(metaContent(loadPage(page), 'meta[name="robots"]')).toContain(
            'noindex'
        );
    });

    it('advertises the RSS, Atom and JSON feeds on the home page', () => {
        const alternates = [
            ...loadPage('index.html').querySelectorAll('link[rel="alternate"]'),
        ].map((link) => link.getAttribute('type'));

        expect(alternates).toEqual(
            expect.arrayContaining([
                'application/rss+xml',
                'application/atom+xml',
                'application/feed+json',
            ])
        );
    });
});

describe('structured data (JSON-LD)', () => {
    it.each(listHtmlPages())('%s embeds only valid JSON-LD', (page) => {
        for (const block of jsonLdBlocks(page)) {
            expect(block['@context']).toBe('https://schema.org');
            expect(block['@type']).toBeTruthy();
        }
    });

    it('describes the person, website and navigation on the home page', () => {
        expect(jsonLdTypes('index.html')).toEqual(
            expect.arrayContaining(['ProfilePage', 'WebSite', 'ItemList'])
        );
    });

    it.each(getAllArticles().map((article) => article))(
        'marks up $slug as a BlogPosting with a breadcrumb',
        (article) => {
            const page = `articles/${article.slug}.html`;
            const posting = jsonLdBlocks(page).find(
                (block) => block['@type'] === 'BlogPosting'
            );

            expect(posting?.headline).toBe(article.title);
            expect(posting?.datePublished).toContain(article.date);
            expect(jsonLdTypes(page)).toContain('BreadcrumbList');
        }
    );

    it('marks up the resume as a ProfilePage', () => {
        expect(jsonLdTypes('resume.html')).toContain('ProfilePage');
    });
});

describe('sitemap and robots', () => {
    const sitemap = new XMLParser().parse(readOut('sitemap.xml')) as {
        urlset: { url: { loc: string }[] | { loc: string } };
    };
    const urls = [sitemap.urlset.url].flat().map((entry) => String(entry.loc));

    it('lists only absolute URLs on the site domain', () => {
        for (const url of urls) {
            expect(url.startsWith(siteURL)).toBe(true);
        }
    });

    it('lists only URLs that the export actually serves', () => {
        for (const url of urls) {
            expect(resolveRoute(toSitePath(url)), url).not.toBeNull();
        }
    });

    it('includes the main pages and every published article', () => {
        const paths = urls.map(toSitePath);

        expect(paths).toEqual(
            expect.arrayContaining([
                '/',
                '/uses',
                '/now',
                '/resume',
                '/articles',
            ])
        );
        for (const article of getAllArticles()) {
            expect(paths).toContain(`/articles/${article.slug}`);
        }
    });

    it('leaves out search, network status and the studio', () => {
        const paths = urls.map(toSitePath);

        expect(paths).not.toContain('/articles/search');
        expect(paths).not.toContain('/network-status');
        expect(paths.some((path) => path.startsWith('/studio'))).toBe(false);
    });

    it('allows crawling and points robots.txt at the sitemap', () => {
        const robots = readOut('robots.txt');

        expect(robots).toMatch(/User-Agent: \*/i);
        expect(robots).toMatch(/Allow: \//);
        expect(robots).toContain(`Sitemap: ${siteURL}/sitemap.xml`);
    });
});
