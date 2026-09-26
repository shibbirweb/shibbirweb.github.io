import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import {
    articleOgImagePath,
    buildArticleCoverSvg,
    coverGradientForSlug,
    generatedCoverPath,
    hashString,
    layoutCoverTitle,
    measureTitleWidth,
} from '@/utils/generateArticleCover';

// The text column runs from x=90 to a mirrored right margin on a 1200-wide cover.
const TITLE_COLUMN_WIDTH = 1200 - 90 * 2;
// Band between the tag eyebrow and the footer that the title block must stay in.
const TITLE_TOP_LIMIT = 172;
const TITLE_BOTTOM_LIMIT = 512;

const HEX_COLOUR = /^#[0-9a-f]{6}$/;

const longTitle =
    'An extremely long article title that keeps on going with many many words so that it cannot possibly fit on a single line of the cover and has to wrap across several lines while staying inside the column and the title band without touching the footer';

function titleLines(svg: string): string[] {
    return [...svg.matchAll(/<tspan[^>]*>([^<]*)<\/tspan>/g)].map(
        (match) => match[1]
    );
}

describe('hashString', () => {
    it('is deterministic for the same input', () => {
        expect(hashString('my-slug')).toBe(hashString('my-slug'));
    });

    it('returns an unsigned 32-bit integer', () => {
        for (const seed of ['', 'a', 'a much longer seed string'.repeat(20)]) {
            const hash = hashString(seed);
            expect(Number.isInteger(hash)).toBe(true);
            expect(hash).toBeGreaterThanOrEqual(0);
            expect(hash).toBeLessThan(2 ** 32);
        }
    });

    it('differs for different inputs', () => {
        expect(hashString('alpha')).not.toBe(hashString('beta'));
    });
});

describe('measureTitleWidth', () => {
    it('scales linearly with the font size', () => {
        expect(measureTitleWidth('Hello', 60)).toBeCloseTo(
            measureTitleWidth('Hello', 30) * 2
        );
    });

    it('measures wide glyphs wider than narrow ones', () => {
        expect(measureTitleWidth('WWWW', 50)).toBeGreaterThan(
            measureTitleWidth('iiii', 50)
        );
    });

    it('measures an empty string as zero', () => {
        expect(measureTitleWidth('', 50)).toBe(0);
    });
});

describe('path helpers', () => {
    it('places generated covers under /images/articles/generated', () => {
        expect(generatedCoverPath('my-post')).toBe(
            '/images/articles/generated/my-post.svg'
        );
    });

    it('places raster OG images under /og/articles as PNG', () => {
        expect(articleOgImagePath('my-post')).toBe('/og/articles/my-post.png');
    });
});

describe('coverGradientForSlug', () => {
    it('picks the same pair for the same slug', () => {
        expect(coverGradientForSlug('my-post')).toEqual(
            coverGradientForSlug('my-post')
        );
    });

    it('returns two hex colours', () => {
        const [from, to] = coverGradientForSlug('another-post');
        expect(from).toMatch(HEX_COLOUR);
        expect(to).toMatch(HEX_COLOUR);
    });

    it('spreads different slugs over more than one gradient', () => {
        const pairs = new Set(
            Array.from({ length: 20 }, (_, index) =>
                coverGradientForSlug(`post-${index}`).join()
            )
        );
        expect(pairs.size).toBeGreaterThan(1);
    });
});

describe('layoutCoverTitle', () => {
    it('keeps a short title on one line at the largest size', () => {
        const layout = layoutCoverTitle('Short title');
        expect(layout.lines).toEqual(['Short title']);
        expect(layout.fontSize).toBe(62);
        expect(layout.lineHeight).toBe(74);
    });

    it('centres a single line on the title centre line', () => {
        expect(layoutCoverTitle('Short title').firstLineY).toBe(300);
    });

    it('wraps a long title without any line overflowing the column', () => {
        const layout = layoutCoverTitle(longTitle);
        expect(layout.lines.length).toBeGreaterThan(1);
        for (const line of layout.lines) {
            expect(
                measureTitleWidth(line, layout.fontSize)
            ).toBeLessThanOrEqual(TITLE_COLUMN_WIDTH);
        }
    });

    it('keeps a tall block inside the band between eyebrow and footer', () => {
        const layout = layoutCoverTitle(longTitle);
        const lastBaseline =
            layout.firstLineY + (layout.lines.length - 1) * layout.lineHeight;
        expect(
            layout.firstLineY - layout.fontSize * 0.78
        ).toBeGreaterThanOrEqual(TITLE_TOP_LIMIT - 0.001);
        expect(lastBaseline).toBeLessThanOrEqual(TITLE_BOTTOM_LIMIT);
    });

    it('never drops words from a title that fits after shrinking', () => {
        const layout = layoutCoverTitle(longTitle);
        expect(layout.lines.join(' ')).toBe(longTitle);
    });

    it('truncates with an ellipsis only as a last resort', () => {
        const hugeTitle = 'word '.repeat(400).trim();
        const layout = layoutCoverTitle(hugeTitle);
        expect(layout.fontSize).toBe(38);
        expect(layout.lines[layout.lines.length - 1].endsWith('…')).toBe(true);
        for (const line of layout.lines) {
            expect(
                measureTitleWidth(line, layout.fontSize)
            ).toBeLessThanOrEqual(TITLE_COLUMN_WIDTH);
        }
    });

    it('breaks a single word too wide for the column into fitting chunks', () => {
        const layout = layoutCoverTitle('W'.repeat(60));
        expect(layout.lines.length).toBeGreaterThan(1);
        expect(layout.lines.join('')).toBe('W'.repeat(60));
        for (const line of layout.lines) {
            expect(
                measureTitleWidth(line, layout.fontSize)
            ).toBeLessThanOrEqual(TITLE_COLUMN_WIDTH);
        }
    });
});

describe('buildArticleCoverSvg', () => {
    const cover = buildArticleCoverSvg({
        slug: 'my-post',
        title: 'How git cherry-pick rescued a hotfix',
        tag: 'Git',
    });

    it('produces well-formed XML', () => {
        expect(XMLValidator.validate(cover)).toBe(true);
    });

    it('is a 1200x630 SVG with a matching viewBox', () => {
        const parsed = new XMLParser({ ignoreAttributes: false }).parse(cover);
        expect(parsed.svg['@_width']).toBe('1200');
        expect(parsed.svg['@_height']).toBe('630');
        expect(parsed.svg['@_viewBox']).toBe('0 0 1200 630');
        expect(parsed.svg['@_xmlns']).toBe('http://www.w3.org/2000/svg');
    });

    it('is identical for the same inputs (reproducible builds)', () => {
        expect(
            buildArticleCoverSvg({
                slug: 'my-post',
                title: 'How git cherry-pick rescued a hotfix',
                tag: 'Git',
            })
        ).toBe(cover);
    });

    it('uses the slug gradient pair as its stops', () => {
        const [from, to] = coverGradientForSlug('my-post');
        expect(cover).toContain(`stop-color="${from}"`);
        expect(cover).toContain(`stop-color="${to}"`);
        expect(cover).toContain('id="bg-my-post"');
    });

    it('uppercases the first tag as the eyebrow', () => {
        expect(cover).toMatch(/<text[^>]*y="120"[^>]*>GIT<\/text>/);
    });

    it('omits the eyebrow when there is no tag', () => {
        const untagged = buildArticleCoverSvg({ slug: 'x', title: 'Title' });
        expect(untagged).not.toContain('y="120"');
        expect(XMLValidator.validate(untagged)).toBe(true);
    });

    it('carries the title as the accessible label and the text lines', () => {
        expect(cover).toContain(
            'aria-label="How git cherry-pick rescued a hotfix"'
        );
        expect(titleLines(cover).join(' ')).toBe(
            'How git cherry-pick rescued a hotfix'
        );
    });

    it('carries the shibbir.me footer', () => {
        expect(cover).toContain('>shibbir.me</text>');
    });

    it('escapes XML characters in the title and tag', () => {
        const escaped = buildArticleCoverSvg({
            slug: 'escape',
            title: 'Tom & "Jerry" <script>',
            tag: 'R&D <b>',
        });
        expect(XMLValidator.validate(escaped)).toBe(true);
        expect(escaped).not.toContain('<script>');
        expect(escaped).toContain('Tom &amp; &quot;Jerry&quot; &lt;script&gt;');
        expect(escaped).toContain('R&amp;D &lt;B&gt;');
    });

    it('wraps a long title into several tspans that fit the column', () => {
        const wrapped = buildArticleCoverSvg({
            slug: 'long',
            title: longTitle,
            tag: 'Laravel',
        });
        const fontSize = Number(
            wrapped.match(/font-size="(\d+)" font-weight="800"/)?.[1]
        );
        const lines = titleLines(wrapped);
        expect(lines.length).toBeGreaterThan(1);
        for (const line of lines) {
            expect(measureTitleWidth(line, fontSize)).toBeLessThanOrEqual(
                TITLE_COLUMN_WIDTH
            );
        }
        const baselines = [
            ...wrapped.matchAll(/<tspan x="90" y="([\d.]+)">/g),
        ].map((match) => Number(match[1]));
        expect(Math.max(...baselines)).toBeLessThanOrEqual(TITLE_BOTTOM_LIMIT);
    });
});
