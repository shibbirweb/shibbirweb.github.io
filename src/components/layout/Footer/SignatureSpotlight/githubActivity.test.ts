import { describe, expect, it } from 'vitest';
import {
    COUNT_LEVEL_LIFT,
    countRangesByLevel,
    DAY_TEXTURE_DEPTH,
    decodeCachedActivity,
    encodeCachedActivity,
    isActivityFresh,
    keepRecentDays,
    mapDaysToCells,
    parseContributionLevels,
    refineLevelByCount,
    toLocalIsoDate,
} from '@/components/layout/Footer/SignatureSpotlight/githubActivity';

describe('parseContributionLevels', () => {
    it('returns one level per day, oldest first', () => {
        expect(
            parseContributionLevels({
                total: { lastYear: 5 },
                contributions: [
                    { date: '2026-01-03', count: 4, level: 2 },
                    { date: '2026-01-01', count: 0, level: 0 },
                    { date: '2026-01-02', count: 9, level: 4 },
                ],
            })
        ).toEqual([0, 4, 2]);
    });

    it('lifts a busier day above a quieter one on the same level', () => {
        expect(
            parseContributionLevels({
                contributions: [
                    { date: '2026-01-01', count: 1, level: 1 },
                    { date: '2026-01-02', count: 9, level: 1 },
                    { date: '2026-01-03', count: 5, level: 1 },
                    { date: '2026-01-04', count: 20, level: 2 },
                ],
            })
        ).toEqual([1, 1 + COUNT_LEVEL_LIFT, 1 + COUNT_LEVEL_LIFT / 2, 2]);
    });

    it('measures the count range over the whole year, not just the kept days', () => {
        expect(
            parseContributionLevels(
                {
                    contributions: [
                        { date: '2026-01-01', count: 1, level: 1 },
                        { date: '2026-01-02', count: 16, level: 1 },
                        { date: '2026-01-03', count: 4, level: 1 },
                    ],
                },
                '2026-01-01'
            )
        ).toEqual([1]);
        expect(
            parseContributionLevels({
                contributions: [
                    { date: '2026-01-01', count: 1, level: 1 },
                    { date: '2026-01-02', count: 16, level: 1 },
                ],
            })?.[1]
        ).toBe(1 + COUNT_LEVEL_LIFT);
    });

    it('keeps the plain level when the count is missing or invalid', () => {
        expect(
            parseContributionLevels({
                contributions: [
                    { date: '2026-01-01', level: 1 },
                    { date: '2026-01-02', count: 'many', level: 2 },
                    { date: '2026-01-03', count: -3, level: 3 },
                    { date: '2026-01-04', count: 2, level: 1 },
                ],
            })
        ).toEqual([1, 2, 3, 1]);
    });

    it('rejects missing, empty or malformed responses', () => {
        expect(parseContributionLevels(null)).toBeNull();
        expect(parseContributionLevels({})).toBeNull();
        expect(parseContributionLevels({ contributions: [] })).toBeNull();
        expect(parseContributionLevels({ contributions: 'nope' })).toBeNull();
        expect(
            parseContributionLevels({
                contributions: [{ date: '2026-01-01', level: 7 }],
            })
        ).toBeNull();
        expect(
            parseContributionLevels({
                contributions: [{ date: '2026-01-01' }],
            })
        ).toBeNull();
    });
});

describe('refineLevelByCount', () => {
    const range = { lowest: 1, highest: 16 };

    it('keeps the quietest day of a level on that level', () => {
        expect(refineLevelByCount(1, 1, range)).toBe(1);
    });

    it('lifts the busiest day of a level by COUNT_LEVEL_LIFT', () => {
        expect(refineLevelByCount(1, 16, range)).toBe(1 + COUNT_LEVEL_LIFT);
    });

    it('never lifts a level into the next one', () => {
        expect(COUNT_LEVEL_LIFT).toBeLessThan(1);
        expect(refineLevelByCount(3, 99, range)).toBe(3 + COUNT_LEVEL_LIFT);
    });

    it('leaves empty days, the top level and a missing count alone', () => {
        expect(refineLevelByCount(0, 0, { lowest: 0, highest: 0 })).toBe(0);
        expect(refineLevelByCount(4, 80, { lowest: 50, highest: 90 })).toBe(4);
        expect(refineLevelByCount(2, null, range)).toBe(2);
        expect(refineLevelByCount(2, 5, null)).toBe(2);
        expect(refineLevelByCount(2, 5, { lowest: 5, highest: 5 })).toBe(2);
    });
});

describe('countRangesByLevel', () => {
    it('finds the lowest and highest count of each level, skipping missing counts', () => {
        const ranges = countRangesByLevel([
            { date: '2026-01-01', count: 3, level: 1 },
            { date: '2026-01-02', count: 12, level: 1 },
            { date: '2026-01-03', count: null, level: 1 },
            { date: '2026-01-04', count: 30, level: 2 },
        ]);
        expect(ranges.get(1)).toEqual({ lowest: 3, highest: 12 });
        expect(ranges.get(2)).toEqual({ lowest: 30, highest: 30 });
        expect(ranges.get(3)).toBeUndefined();
    });
});

describe('cached activity', () => {
    it('round-trips through encode and decode', () => {
        const raw = encodeCachedActivity([0, 1.25, 4, 2], 1234);
        expect(decodeCachedActivity(raw)).toEqual({
            savedAt: 1234,
            levels: [0, 1.25, 4, 2],
        });
    });

    it('packs the levels rounded to two decimals', () => {
        expect(encodeCachedActivity([0, 1 + 1 / 3, 4], 1)).toBe(
            '{"savedAt":1,"levels":[0,1.33,4]}'
        );
    });

    it('ignores missing or corrupt entries', () => {
        expect(decodeCachedActivity(null)).toBeNull();
        expect(decodeCachedActivity('not json')).toBeNull();
        expect(
            decodeCachedActivity('{"savedAt":"1","levels":[0,1]}')
        ).toBeNull();
        expect(decodeCachedActivity('{"savedAt":1,"levels":[0,9]}')).toBeNull();
        expect(
            decodeCachedActivity('{"savedAt":1,"levels":[0,-1]}')
        ).toBeNull();
        expect(decodeCachedActivity('{"savedAt":1,"levels":["1"]}')).toBeNull();
        expect(decodeCachedActivity('{"savedAt":1,"levels":[]}')).toBeNull();
    });

    it('drops an entry in the older digit string format, so it is fetched again', () => {
        expect(decodeCachedActivity('{"savedAt":1,"levels":"014"}')).toBeNull();
    });
});

describe('isActivityFresh', () => {
    const fourHours = 4 * 60 * 60 * 1000;

    it('is fresh inside the max age and stale after it', () => {
        expect(isActivityFresh(0, fourHours - 1, fourHours)).toBe(true);
        expect(isActivityFresh(0, fourHours, fourHours)).toBe(false);
    });

    it('treats a time stamp from the future as stale', () => {
        expect(isActivityFresh(10, 5, fourHours)).toBe(false);
    });
});

describe('mapDaysToCells', () => {
    // One row of 31 columns (x 0..30), so three days get ten columns each.
    const cells = Array.from({ length: 31 }, (_, column) => ({
        x: column,
        y: 0,
    }));
    const levelAt = (levels: number[], x: number) => levels[x];

    it('gives the middle of each day its real level, oldest on the left', () => {
        const levels = mapDaysToCells(cells, [4, 0, 2]);
        expect(levelAt(levels, 0)).toBeGreaterThanOrEqual(
            4 * (1 - DAY_TEXTURE_DEPTH)
        );
        expect(levelAt(levels, 15)).toBe(0);
        expect(levelAt(levels, 30)).toBeGreaterThanOrEqual(
            2 * (1 - DAY_TEXTURE_DEPTH)
        );
        expect(levelAt(levels, 30)).toBeLessThanOrEqual(2);
    });

    it('softens the border between a busy and a quiet day', () => {
        const levels = mapDaysToCells(cells, [0, 4, 0]);
        // Deep inside the quiet days nothing lights up.
        expect(levelAt(levels, 2)).toBe(0);
        expect(levelAt(levels, 28)).toBe(0);
        // At the borders (x 10 and 20) the level sits between the two days.
        for (const border of [10, 20]) {
            expect(levelAt(levels, border)).toBeGreaterThan(0.5);
            expect(levelAt(levels, border)).toBeLessThan(3.5);
        }
    });

    it('never goes above the busier of the two neighbouring days', () => {
        const levels = mapDaysToCells(cells, [1, 3, 2]);
        levels.forEach((level) => {
            expect(level).toBeGreaterThanOrEqual(0);
            expect(level).toBeLessThanOrEqual(3);
        });
    });

    it('is deterministic for the same data', () => {
        expect(mapDaysToCells(cells, [1, 2, 3])).toEqual(
            mapDaysToCells(cells, [1, 2, 3])
        );
    });

    it('returns all zeros when there are no days or cells', () => {
        expect(mapDaysToCells(cells, [])).toEqual(new Array(31).fill(0));
        expect(mapDaysToCells([], [1, 2])).toEqual([]);
    });

    it('is all zeros when every day was quiet', () => {
        expect(mapDaysToCells(cells, [0, 0, 0])).toEqual(new Array(31).fill(0));
    });
});

describe('recent days', () => {
    it('skips days after the last date', () => {
        expect(
            parseContributionLevels(
                {
                    contributions: [
                        { date: '2026-01-01', level: 1 },
                        { date: '2026-01-02', level: 2 },
                        { date: '2026-01-03', level: 3 },
                    ],
                },
                '2026-01-02'
            )
        ).toEqual([1, 2]);
    });

    it('keeps only the newest days', () => {
        expect(keepRecentDays([0, 1, 2, 3, 4], 3)).toEqual([2, 3, 4]);
        expect(keepRecentDays([1, 2], 30)).toEqual([1, 2]);
    });

    it('formats a local date the way the proxy does', () => {
        expect(toLocalIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
});
