import { describe, expect, it } from 'vitest';
import {
    SHADES_PER_LEVEL,
    buildShadeColors,
    mixColors,
    parseHexColor,
    shadeIndexFor,
} from '@/components/layout/Footer/SignatureSpotlight/activityColors';

describe('parseHexColor', () => {
    it('parses six and three digit hex colours', () => {
        expect(parseHexColor('#a3a3a3')).toEqual([163, 163, 163]);
        expect(parseHexColor(' #fff ')).toEqual([255, 255, 255]);
    });

    it('returns null for anything else', () => {
        expect(parseHexColor('')).toBeNull();
        expect(parseHexColor('rgb(0 0 0)')).toBeNull();
        expect(parseHexColor('#12345')).toBeNull();
    });
});

describe('mixColors', () => {
    it('blends between the two colours', () => {
        expect(mixColors([0, 0, 0], [255, 255, 255], 0)).toBe('rgb(0 0 0)');
        expect(mixColors([0, 0, 0], [255, 255, 255], 0.5)).toBe(
            'rgb(128 128 128)'
        );
        expect(mixColors([0, 0, 0], [255, 255, 255], 1)).toBe(
            'rgb(255 255 255)'
        );
    });
});

describe('buildShadeColors', () => {
    const levelColors = ['#000000', '#808080', '#ffffff'];
    const shades = buildShadeColors(levelColors);

    it('has every in-between shade plus the last level', () => {
        expect(shades).toHaveLength(2 * SHADES_PER_LEVEL + 1);
    });

    it('lands exactly on each level colour', () => {
        expect(shades[0]).toBe('#000000');
        expect(shades[SHADES_PER_LEVEL]).toBe('#808080');
        expect(shades[2 * SHADES_PER_LEVEL]).toBe('#ffffff');
    });

    it('mixes the steps between levels', () => {
        expect(shades[SHADES_PER_LEVEL / 2]).toBe('rgb(64 64 64)');
    });

    it('falls back to the nearest level when a colour cannot be parsed', () => {
        const fallback = buildShadeColors(['red', '#ffffff']);
        expect(fallback[1]).toBe('red');
        expect(fallback[SHADES_PER_LEVEL - 1]).toBe('#ffffff');
    });
});

describe('shadeIndexFor', () => {
    it('maps whole and fractional levels to shade steps', () => {
        expect(shadeIndexFor(0)).toBe(0);
        expect(shadeIndexFor(2)).toBe(2 * SHADES_PER_LEVEL);
        expect(shadeIndexFor(0.5)).toBe(SHADES_PER_LEVEL / 2);
    });
});
