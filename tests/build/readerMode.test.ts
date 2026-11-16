import { describe, expect, it } from 'vitest';
import { siteAuthor } from '@/config/constants';
import { DIAGRAM_FALLBACK_IMAGE_CLASS } from '@/components/pages/articles/diagramFallbackImage';
import { DIAGRAM_IMAGE_SCALE, readPngSize } from '@/lib/diagramImages';
import {
    articleSlugs,
    loadPage,
    outExists,
    readAssetByUrl,
    readOutBuffer,
    stylesheetUrls,
} from '@tests/build/helpers';

// Browser reading modes (Chrome Reading mode, Firefox Reader View, Safari Reader)
// rebuild an article from its markup, so the static HTML must carry what they
// look for: a rel="author" byline, the extras in an article <footer> they drop,
// and a pre-rendered image beside each diagram, since they throw the live SVG
// away. The images must stay hidden on the page itself.

const articlePages = articleSlugs().map((slug) => ({
    slug,
    file: `articles/${slug}.html`,
}));

const diagramPages = articlePages.filter(
    ({ file }) =>
        loadPage(file).querySelector('pre.mermaid, pre.reactflow') !== null
);

describe('article markup for browser reading modes', () => {
    it('has articles with diagrams to check', () => {
        expect(diagramPages.length).toBeGreaterThan(0);
    });

    for (const { slug, file } of articlePages) {
        it(`${slug} names its author with rel="author"`, () => {
            const author = loadPage(file).querySelector(
                'article a[rel="author"]'
            );

            expect(author?.textContent).toBe(siteAuthor);
        });

        it(`${slug} keeps sharing, the pager and comments in the article footer`, () => {
            const footer = loadPage(file).querySelector('article footer');

            expect(footer?.textContent).toContain('Share this article');
            expect(
                footer?.querySelector('[aria-label="Comments"]')
            ).not.toBeNull();
        });
    }

    for (const { slug, file } of diagramPages) {
        it(`${slug} puts a hidden image before every diagram`, () => {
            const blocks = loadPage(file).querySelectorAll(
                'pre.mermaid, pre.reactflow'
            );

            for (const block of blocks) {
                const image = block.previousElementSibling;
                expect(image?.tagName).toBe('IMG');
                expect(
                    image?.classList.contains(DIAGRAM_FALLBACK_IMAGE_CLASS)
                ).toBe(true);
                expect(image?.getAttribute('aria-hidden')).toBe('true');
                expect(image?.getAttribute('loading')).toBe('lazy');
                expect(image?.getAttribute('alt')).toMatch(/^Diagram/);
            }
        });

        it(`${slug} points each diagram image at a PNG of its stated size`, () => {
            const images = loadPage(file).querySelectorAll(
                `img.${DIAGRAM_FALLBACK_IMAGE_CLASS}`
            );

            for (const image of images) {
                const source = image.getAttribute('src') ?? '';
                expect(source).toMatch(/^\/diagrams\/[0-9a-f]{16}\.png$/);
                expect(outExists(source.slice(1)), source).toBe(true);
                const size = readPngSize(readOutBuffer(source.slice(1)));
                expect(Number(image.getAttribute('width'))).toBe(
                    Math.round(size!.width / DIAGRAM_IMAGE_SCALE)
                );
                expect(Number(image.getAttribute('height'))).toBe(
                    Math.round(size!.height / DIAGRAM_IMAGE_SCALE)
                );
            }
        });
    }

    it('hides the diagram images on the page through the stylesheet', () => {
        // Through a stylesheet only: Readability drops an image hidden by an
        // inline style or the `hidden` attribute, but never reads stylesheets.
        const css = stylesheetUrls(diagramPages[0].file)
            .map((url) => readAssetByUrl(url).toString('utf8'))
            .join('\n');

        expect(css).toMatch(
            new RegExp(`\\.${DIAGRAM_FALLBACK_IMAGE_CLASS}\\{display:none\\}`)
        );
        const image = loadPage(diagramPages[0].file).querySelector(
            `img.${DIAGRAM_FALLBACK_IMAGE_CLASS}`
        );
        expect(image?.hasAttribute('hidden')).toBe(false);
        expect(image?.getAttribute('style')).toBeNull();
    });
});
