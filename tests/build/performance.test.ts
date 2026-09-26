import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import {
    initialScriptUrls,
    listHtmlPages,
    listOutFiles,
    loadPage,
    readAssetByUrl,
    readOutBuffer,
    stylesheetUrls,
} from '@tests/build/helpers';

// Budgets are gzip sizes, set with headroom over what the site ships today, so
// a normal feature passes and an accidental heavy import fails the PR. If a
// change genuinely needs more, raise the number here in the same PR and say why.
const INITIAL_JS_BUDGET_KB = 260;
const CSS_BUDGET_KB = 40;
const HTML_BUDGET_KB = { 'index.html': 130, default: 80 };
// Noto Sans + Zain on home, plus JetBrains Mono on pages that opt into it.
const MAX_PRELOADED_FONTS = 4;

// Heavy libraries that must stay lazily loaded: they are only fetched when a
// diagram is on screen (mermaid) or a reader opens the interactive flow view.
const LAZY_LIBRARY_MARKERS = {
    mermaid: 'sequenceDiagram',
    'React Flow': 'react-flow__pane',
};

const pages = listHtmlPages().filter(
    (page) => page !== 'offline-fallback.html'
);

function gzipKb(buffers: Buffer[]): number {
    return (
        buffers.reduce((total, buffer) => total + gzipSync(buffer).length, 0) /
        1024
    );
}

describe('performance budgets', () => {
    it.each(pages)(
        `%s loads under ${INITIAL_JS_BUDGET_KB} KB of gzipped JS up front`,
        (page) => {
            const size = gzipKb(initialScriptUrls(page).map(readAssetByUrl));

            expect(size).toBeLessThan(INITIAL_JS_BUDGET_KB);
        }
    );

    it.each(pages)(
        `%s loads under ${CSS_BUDGET_KB} KB of gzipped CSS`,
        (page) => {
            const size = gzipKb(stylesheetUrls(page).map(readAssetByUrl));

            expect(size).toBeLessThan(CSS_BUDGET_KB);
        }
    );

    it.each(pages)('%s keeps its gzipped HTML within budget', (page) => {
        const budget =
            page === 'index.html'
                ? HTML_BUDGET_KB['index.html']
                : HTML_BUDGET_KB.default;

        expect(gzipKb([readOutBuffer(page)])).toBeLessThan(budget);
    });

    it.each(pages)(
        '%s does not load mermaid or React Flow up front',
        (page) => {
            const initialCode = initialScriptUrls(page)
                .map((url) => readAssetByUrl(url).toString('utf8'))
                .join('\n');

            for (const [library, marker] of Object.entries(
                LAZY_LIBRARY_MARKERS
            )) {
                expect(
                    initialCode.includes(marker),
                    `${library} on ${page}`
                ).toBe(false);
            }
        }
    );

    it('still ships mermaid and React Flow as separate lazy chunks', () => {
        const chunks = listOutFiles('_next/static/chunks')
            .filter((file) => file.endsWith('.js'))
            .map((file) => readOutBuffer(file).toString('utf8'));

        for (const marker of Object.values(LAZY_LIBRARY_MARKERS)) {
            expect(chunks.some((code) => code.includes(marker))).toBe(true);
        }
    });

    it('does not publish JavaScript source maps', () => {
        const sourceMaps = listOutFiles('_next').filter((file) =>
            file.endsWith('.map')
        );

        expect(sourceMaps).toEqual([]);
    });

    it.each(pages)(
        `%s preloads at most ${MAX_PRELOADED_FONTS} fonts`,
        (page) => {
            const preloads = loadPage(page).querySelectorAll(
                'link[rel="preload"][as="font"]'
            );

            expect(preloads.length).toBeLessThanOrEqual(MAX_PRELOADED_FONTS);
        }
    );
});

describe('image optimization', () => {
    it.each(pages)(
        '%s gives every image alt text and explicit dimensions',
        (page) => {
            for (const image of loadPage(page).querySelectorAll('img')) {
                const label = image.outerHTML.slice(0, 120);

                expect(image.hasAttribute('alt'), label).toBe(true);
                expect(image.getAttribute('width'), label).toBeTruthy();
                expect(image.getAttribute('height'), label).toBeTruthy();
            }
        }
    );

    it.each(pages)(
        '%s serves raster images as WEBP or lazily loads them',
        (page) => {
            for (const image of loadPage(page).querySelectorAll('img')) {
                const sources = `${image.getAttribute('src') ?? ''} ${image.getAttribute('srcset') ?? ''}`;
                const isRaster = /\.(png|jpe?g)(\s|$|\?)/i.test(sources);

                if (isRaster) {
                    expect(
                        image.getAttribute('loading'),
                        image.outerHTML.slice(0, 120)
                    ).toBe('lazy');
                }
            }
        }
    );
});
