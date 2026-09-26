import { describe, expect, it } from 'vitest';
import { getAllArticles } from '@/lib/posts';
import {
    articleSlugs,
    listOutFiles,
    outExists,
    readOut,
} from '@tests/build/helpers';

const STATIC_PAGES = [
    'index.html',
    '404.html',
    'articles.html',
    'articles/search.html',
    'resume.html',
    'now.html',
    'uses.html',
    'network-status.html',
    'offline-fallback.html',
];

const STATIC_FILES = [
    'feed.xml',
    'atom.xml',
    'feed.json',
    'sitemap.xml',
    'robots.txt',
    'manifest.webmanifest',
    'version.json',
    'sw.js',
    'CNAME',
    'favicon.ico',
    'icon0.svg',
    'icon1.png',
    'apple-icon.png',
    'opengraph-image.png',
    'giscus-light.css',
    'giscus-dark.css',
];

describe('static export routes', () => {
    it.each(STATIC_PAGES)('exports the %s page', (page) => {
        expect(outExists(page)).toBe(true);
    });

    it.each(STATIC_FILES)('exports %s', (file) => {
        expect(outExists(file)).toBe(true);
    });

    it('exports one page per published article and nothing else', () => {
        const publishedSlugs = getAllArticles()
            .map((article) => article.slug)
            .sort();
        const exportedSlugs = listOutFiles('articles')
            .filter((file) => /^articles\/[^/]+\.html$/.test(file))
            .map((file) => file.replace(/^articles\/|\.html$/g, ''))
            .filter((slug) => slug !== 'search')
            .sort();

        expect(publishedSlugs.length).toBeGreaterThan(0);
        expect(exportedSlugs).toEqual(publishedSlugs);
    });

    it('lists the same articles in the feed as it exports', () => {
        const publishedSlugs = getAllArticles().map((article) => article.slug);

        expect(articleSlugs().sort()).toEqual([...publishedSlugs].sort());
    });

    it('keeps the dev-only article editor studio out of the export', () => {
        const studioFiles = listOutFiles().filter((file) =>
            /(^|\/)studio(\/|\.html|\.txt)/.test(file)
        );

        expect(studioFiles).toEqual([]);
    });

    it('serves the custom domain through CNAME', () => {
        expect(readOut('CNAME').trim()).toBe('shibbir.me');
    });

    it('stamps version.json with a valid build time', () => {
        const version = JSON.parse(readOut('version.json')) as {
            builtAt: string;
        };

        expect(Object.keys(version)).toEqual(['builtAt']);
        expect(new Date(version.builtAt).toISOString()).toBe(version.builtAt);
    });

    it('generates an OpenGraph PNG for every article with an SVG cover', () => {
        const svgCoverSlugs = getAllArticles()
            .filter((article) => article.cover.endsWith('.svg'))
            .map((article) => article.slug);

        for (const slug of svgCoverSlugs) {
            expect(outExists(`og/articles/${slug}.png`)).toBe(true);
        }
    });

    it('generates a cover SVG for every article without its own cover', () => {
        const generatedCovers = getAllArticles().filter((article) =>
            article.cover.startsWith('/images/articles/generated/')
        );

        for (const article of generatedCovers) {
            expect(outExists(article.cover.slice(1))).toBe(true);
        }
    });

    it('ships optimized WEBP variants of the local images', () => {
        const optimized = listOutFiles().filter(
            (file) =>
                file.includes('nextImageExportOptimizer/') &&
                file.endsWith('.WEBP')
        );

        expect(optimized.length).toBeGreaterThan(0);
    });
});
