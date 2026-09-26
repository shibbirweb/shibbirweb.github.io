import { describe, expect, it } from 'vitest';
import {
    ACTIVITY_CELL_PITCH,
    BREATH_AMPLITUDE,
    EMPTY_DAY_GLOW,
    ACTIVITY_LEVEL_COUNT,
    ACTIVITY_LEVEL_WEIGHTS,
    breatheLevel,
    createRandom,
    generateActivityLevels,
    listActivityCells,
    pickActivityLevel,
} from '@/components/layout/Footer/SignatureSpotlight/activityField';

describe('pickActivityLevel', () => {
    it('has one weight per level', () => {
        expect(ACTIVITY_LEVEL_WEIGHTS).toHaveLength(ACTIVITY_LEVEL_COUNT);
    });

    it('maps the ends of the range to the first and last level', () => {
        expect(pickActivityLevel(0)).toBe(0);
        expect(pickActivityLevel(0.999999)).toBe(ACTIVITY_LEVEL_COUNT - 1);
    });

    it('never leaves the level range', () => {
        const random = createRandom(42);
        for (let i = 0; i < 1000; i++) {
            const level = pickActivityLevel(random());
            expect(level).toBeGreaterThanOrEqual(0);
            expect(level).toBeLessThan(ACTIVITY_LEVEL_COUNT);
        }
    });
});

describe('listActivityCells', () => {
    it('keeps every cell when the whole box is inside the letters', () => {
        const cells = listActivityCells(40, 20, () => true, 10);
        expect(cells).toHaveLength(8);
    });

    it('keeps only cells whose centre is inside the letters', () => {
        const cells = listActivityCells(40, 20, (x) => x < 20, 10);
        expect(cells).toEqual([
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 10 },
        ]);
    });

    it('centres the grid when the box is not a whole number of cells', () => {
        const [firstCell] = listActivityCells(25, 10, () => true, 10);
        expect(firstCell).toEqual({ x: 2.5, y: 0 });
    });

    it('uses the default pitch', () => {
        const cells = listActivityCells(
            ACTIVITY_CELL_PITCH * 3.5,
            ACTIVITY_CELL_PITCH * 1.5,
            () => true
        );
        expect(cells).toHaveLength(3);
    });
});

describe('generateActivityLevels', () => {
    const levels = generateActivityLevels(500);

    it('returns one level per cell', () => {
        expect(levels).toHaveLength(500);
    });

    it('is identical on every call for the same seed', () => {
        expect(generateActivityLevels(500)).toEqual(levels);
    });

    it('differs between seeds', () => {
        expect(generateActivityLevels(500, 123)).not.toEqual(
            generateActivityLevels(500, 456)
        );
    });

    it('uses every level, so the graph is not a flat fill', () => {
        for (let level = 0; level < ACTIVITY_LEVEL_COUNT; level++) {
            expect(levels).toContain(level);
        }
    });

    it('does not depend on Math.random', () => {
        const originalRandom = Math.random;
        Math.random = () => 0;
        try {
            expect(generateActivityLevels(500)).toEqual(levels);
        } finally {
            Math.random = originalRandom;
        }
    });
});

describe('breatheLevel', () => {
    it('rests on the real level when the envelope is closed', () => {
        expect(breatheLevel(2, 1, 0)).toBe(2);
    });

    it('swells around the real level by at most BREATH_AMPLITUDE', () => {
        expect(breatheLevel(2, 1, 1)).toBeCloseTo(2 + BREATH_AMPLITUDE);
        expect(breatheLevel(2, -1, 1)).toBeCloseTo(2 - BREATH_AMPLITUDE);
    });

    it('lets an empty day glow only faintly, never like real activity', () => {
        expect(breatheLevel(0, 1, 0)).toBe(0);
        expect(breatheLevel(0, -1, 1)).toBe(0);
        expect(breatheLevel(0, 1, 1)).toBeCloseTo(EMPTY_DAY_GLOW);
        expect(EMPTY_DAY_GLOW).toBeLessThan(1 - BREATH_AMPLITUDE);
    });

    it('stays inside the level range', () => {
        expect(breatheLevel(ACTIVITY_LEVEL_COUNT - 1, 1, 1)).toBe(
            ACTIVITY_LEVEL_COUNT - 1
        );
    });
});
