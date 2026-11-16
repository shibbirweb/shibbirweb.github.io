import { describe, expect, it } from 'vitest';
import {
    buildRailPath,
    RAIL_INDENT_PX,
    railRange,
    railX,
    tocDepth,
    type RailItem,
} from '@/components/pages/articles/TableOfContents/TocRail/railPath';

const items: RailItem[] = [
    { top: 0, bottom: 30, depth: 0 },
    { top: 30, bottom: 60, depth: 1 },
    { top: 60, bottom: 90, depth: 1 },
    { top: 90, bottom: 120, depth: 0 },
];

describe('tocDepth', () => {
    it('nests H3 entries one level under H2', () => {
        expect(tocDepth(2)).toBe(0);
        expect(tocDepth(3)).toBe(1);
    });
});

describe('railX', () => {
    it('steps in by the indent per depth', () => {
        expect(railX(1) - railX(0)).toBe(RAIL_INDENT_PX);
    });
});

describe('buildRailPath', () => {
    it('returns an empty path for no entries', () => {
        expect(buildRailPath([])).toBe('');
    });

    it('draws a straight line when every entry shares a depth', () => {
        expect(
            buildRailPath([
                { top: 0, bottom: 30, depth: 0 },
                { top: 30, bottom: 60, depth: 0 },
            ])
        ).toBe('M 1 0 L 1 30 L 1 60');
    });

    it('curves in and back out around nested entries', () => {
        expect(buildRailPath(items)).toBe(
            [
                'M 1 0',
                'L 1 24',
                'C 1 30 13 30 13 36',
                'L 13 60',
                'L 13 84',
                'C 13 90 1 90 1 96',
                'L 1 120',
            ].join(' ')
        );
    });
});

describe('railRange', () => {
    it('is null when nothing is visible', () => {
        expect(railRange(items, [])).toBeNull();
    });

    it('spans the visible entries', () => {
        expect(railRange(items, [1, 2])).toEqual({
            top: 36,
            bottom: 84,
            topX: 13,
            bottomX: 13,
        });
    });

    it('stops each end short of a bend into a neighbour', () => {
        expect(railRange(items, [0])).toEqual({
            top: 0,
            bottom: 24,
            topX: 1,
            bottomX: 1,
        });
        expect(railRange(items, [3])).toEqual({
            top: 96,
            bottom: 120,
            topX: 1,
            bottomX: 1,
        });
    });

    it('takes each end from the depth of the entry there', () => {
        expect(railRange(items, [0, 1])).toMatchObject({
            topX: 1,
            bottomX: 13,
        });
    });
});
