import { describe, expect, it } from 'vitest';
import { pageGradientColors } from '@/utils/pageGradient';

const HSL_PATTERN = /^hsl\((\d+) 35% 52%\)$/;

function hueOf(colour: string): number {
    const match = colour.match(HSL_PATTERN);
    if (!match) {
        throw new Error(`Not a page gradient colour: ${colour}`);
    }
    return Number(match[1]);
}

const samplePaths = [
    '/uses',
    '/now',
    '/articles',
    '/resume',
    '/articles/some-post',
    '/network-status',
    '/studio/article-editor',
    '/tags/git',
];

describe('pageGradientColors', () => {
    it('returns the same pair for the same path every time', () => {
        expect(pageGradientColors('/uses')).toEqual(
            pageGradientColors('/uses')
        );
    });

    it('gives different paths different colours', () => {
        const fromHues = new Set(
            samplePaths.map((path) => pageGradientColors(path).from)
        );
        expect(fromHues.size).toBeGreaterThan(1);
    });

    it('emits low-saturation HSL colours with hues in 0 to 359', () => {
        for (const path of samplePaths) {
            const { from, to } = pageGradientColors(path);
            expect(from).toMatch(HSL_PATTERN);
            expect(to).toMatch(HSL_PATTERN);
            expect(hueOf(from)).toBeLessThan(360);
            expect(hueOf(to)).toBeLessThan(360);
        }
    });

    it('separates the two hues by 120 to 200 degrees going around the wheel', () => {
        for (const path of samplePaths) {
            const { from, to } = pageGradientColors(path);
            const separation = (hueOf(to) - hueOf(from) + 360) % 360;
            expect(separation).toBeGreaterThanOrEqual(120);
            expect(separation).toBeLessThan(200);
        }
    });
});
