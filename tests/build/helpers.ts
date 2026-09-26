import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { JSDOM } from 'jsdom';
import { siteURL } from '@/config/constants';

export const OUT_DIRECTORY = join(process.cwd(), 'out');

export interface FeedArticle {
    id: string;
    url: string;
    title: string;
    image?: string;
}

/** Reads a file from the static export as text. */
export function readOut(relativePath: string): string {
    return readFileSync(join(OUT_DIRECTORY, relativePath), 'utf8');
}

/** Reads a file from the static export as raw bytes. */
export function readOutBuffer(relativePath: string): Buffer {
    return readFileSync(join(OUT_DIRECTORY, relativePath));
}

export function outExists(relativePath: string): boolean {
    return existsSync(join(OUT_DIRECTORY, relativePath));
}

/** Every file under a folder of the export, as paths relative to ./out. */
export function listOutFiles(folder = ''): string[] {
    const files: string[] = [];
    const walk = (directory: string) => {
        for (const entry of readdirSync(directory)) {
            const fullPath = join(directory, entry);
            if (statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else {
                files.push(relative(OUT_DIRECTORY, fullPath));
            }
        }
    };
    walk(join(OUT_DIRECTORY, folder));
    return files.sort();
}

/** The exported HTML pages a visitor can reach (Next internals excluded). */
export function listHtmlPages(): string[] {
    return listOutFiles().filter(
        (file) =>
            file.endsWith('.html') &&
            !file.startsWith('_next/') &&
            !file.startsWith('_not-found')
    );
}

/**
 * Resolves a site path the way GitHub Pages (and scripts/serve-out.ts) does:
 * the exact file, then `<path>.html`, then `<path>/index.html`. Returns the
 * matching path relative to ./out, or null when nothing would be served.
 */
export function resolveRoute(sitePath: string): string | null {
    const pathname = decodeURIComponent(sitePath.split(/[?#]/)[0] || '/');
    const trimmed = pathname.replace(/^\/+/, '');
    const candidates =
        extname(trimmed) !== ''
            ? [trimmed]
            : [trimmed, `${trimmed}.html`, join(trimmed, 'index.html')];
    for (const candidate of candidates) {
        const fullPath = join(OUT_DIRECTORY, candidate);
        if (existsSync(fullPath) && statSync(fullPath).isFile()) {
            return candidate;
        }
    }
    return null;
}

/** Turns an absolute site URL (https://shibbir.me/x) into a site path (/x). */
export function toSitePath(url: string): string {
    if (url.startsWith(siteURL)) {
        return url.slice(siteURL.length) || '/';
    }
    return url;
}

/** The site path an exported HTML file is served at. */
export function pagePath(htmlFile: string): string {
    if (htmlFile === 'index.html') {
        return '/';
    }
    return `/${htmlFile.replace(/\.html$/, '')}`;
}

const documentCache = new Map<string, Document>();

/** Parses an exported HTML page into a DOM document (cached per file). */
export function loadPage(htmlFile: string): Document {
    const cached = documentCache.get(htmlFile);
    if (cached) {
        return cached;
    }
    const document = new JSDOM(readOut(htmlFile)).window.document;
    documentCache.set(htmlFile, document);
    return document;
}

/** Published articles as listed in the exported JSON feed. */
export function feedArticles(): FeedArticle[] {
    const feed = JSON.parse(readOut('feed.json')) as { items: FeedArticle[] };
    return feed.items;
}

/** The article slugs that must exist in the export. */
export function articleSlugs(): string[] {
    return feedArticles().map((item) =>
        toSitePath(item.url).replace(/^\/articles\//, '')
    );
}

/** Script URLs a page loads up front (deduplicated, as written in the HTML). */
export function initialScriptUrls(htmlFile: string): string[] {
    const scripts = loadPage(htmlFile).querySelectorAll('script[src]');
    return [
        ...new Set(
            [...scripts].map((script) => script.getAttribute('src') ?? '')
        ),
    ].filter((source) => source.startsWith('/'));
}

/** Stylesheet URLs a page loads up front. */
export function stylesheetUrls(htmlFile: string): string[] {
    const links = loadPage(htmlFile).querySelectorAll(
        'link[rel="stylesheet"][href]'
    );
    return [...new Set([...links].map((link) => link.getAttribute('href')!))];
}

/** Reads an asset referenced by a site URL such as /_next/static/x%5By%5D.js. */
export function readAssetByUrl(url: string): Buffer {
    return readOutBuffer(decodeURIComponent(url.split('?')[0]).slice(1));
}

/** The parsed JSON-LD objects embedded in a page. */
export function jsonLdBlocks(htmlFile: string): Record<string, unknown>[] {
    const scripts = loadPage(htmlFile).querySelectorAll(
        'script[type="application/ld+json"]'
    );
    return [...scripts].map((script) =>
        JSON.parse(script.textContent ?? 'null')
    );
}
