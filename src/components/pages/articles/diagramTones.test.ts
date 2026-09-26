import { describe, expect, it } from 'vitest';
import {
    DIAGRAM_TONE_HEX,
    DIAGRAM_TONE_HEX_DARK,
} from '@/components/pages/articles/diagramTones';

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

describe('diagram tone palettes', () => {
    it('covers the same tones in light and dark', () => {
        expect(Object.keys(DIAGRAM_TONE_HEX_DARK).sort()).toEqual(
            Object.keys(DIAGRAM_TONE_HEX).sort()
        );
        expect(Object.keys(DIAGRAM_TONE_HEX).sort()).toEqual([
            'allowed',
            'blocked',
            'neutral',
            'secure',
        ]);
    });

    it('spells every value as a literal hex colour', () => {
        for (const colour of [
            ...Object.values(DIAGRAM_TONE_HEX),
            ...Object.values(DIAGRAM_TONE_HEX_DARK),
        ]) {
            expect(colour).toMatch(HEX_COLOUR);
        }
    });

    it('only moves neutral in dark mode', () => {
        expect(DIAGRAM_TONE_HEX_DARK.neutral).not.toBe(
            DIAGRAM_TONE_HEX.neutral
        );
        expect(DIAGRAM_TONE_HEX_DARK.secure).toBe(DIAGRAM_TONE_HEX.secure);
        expect(DIAGRAM_TONE_HEX_DARK.blocked).toBe(DIAGRAM_TONE_HEX.blocked);
        expect(DIAGRAM_TONE_HEX_DARK.allowed).toBe(DIAGRAM_TONE_HEX.allowed);
    });
});
