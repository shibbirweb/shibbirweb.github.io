import { describe, expect, it } from 'vitest';
import {
    listHtmlPages,
    loadPage,
    pagePath,
    resolveRoute,
} from '@tests/build/helpers';

const pages = listHtmlPages();

function isInternal(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//');
}

/** Every internal URL a page references through href, src or srcset. */
function internalReferences(document: Document): string[] {
    const references: string[] = [];
    for (const element of document.querySelectorAll('[href], [src]')) {
        const url =
            element.getAttribute('href') ?? element.getAttribute('src') ?? '';
        if (isInternal(url)) {
            references.push(url);
        }
    }
    for (const element of document.querySelectorAll('[srcset]')) {
        for (const candidate of element.getAttribute('srcset')!.split(',')) {
            const url = candidate.trim().split(/\s+/)[0];
            if (isInternal(url)) {
                references.push(url);
            }
        }
    }
    return [...new Set(references)];
}

describe('internal links and assets', () => {
    it.each(pages)('%s only references files that exist', (page) => {
        const broken = internalReferences(loadPage(page)).filter(
            (url) => resolveRoute(url) === null
        );

        expect(broken).toEqual([]);
    });

    it.each(pages)('%s has a target for every same-page #anchor', (page) => {
        const document = loadPage(page);
        const missing = [...document.querySelectorAll('a[href^="#"]')]
            .map((link) =>
                decodeURIComponent(link.getAttribute('href')!.slice(1))
            )
            .filter((id) => id !== '' && document.getElementById(id) === null);

        expect(missing).toEqual([]);
    });

    it.each(pages)('%s links to home sections that exist', (page) => {
        const home = loadPage('index.html');
        const missing = [...loadPage(page).querySelectorAll('a[href^="/#"]')]
            .map((link) => link.getAttribute('href')!.slice(2))
            .filter((id) => home.getElementById(id) === null);

        expect(missing).toEqual([]);
    });

    it.each(pages)('%s opens new tabs safely', (page) => {
        const unsafe = [
            ...loadPage(page).querySelectorAll('a[target="_blank"]'),
        ].filter(
            (link) =>
                !/noopener|noreferrer/.test(link.getAttribute('rel') ?? '')
        );

        expect(unsafe.map((link) => link.getAttribute('href'))).toEqual([]);
    });

    it('has a skip link to #main and a #main landmark on every page', () => {
        for (const page of pages.filter(
            (candidate) => candidate !== 'offline-fallback.html'
        )) {
            const document = loadPage(page);

            expect(
                document.querySelector('a[href="#main"]'),
                pagePath(page)
            ).not.toBeNull();
            expect(
                document.getElementById('main'),
                pagePath(page)
            ).not.toBeNull();
        }
    });
});
