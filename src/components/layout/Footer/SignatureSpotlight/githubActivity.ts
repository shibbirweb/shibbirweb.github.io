// Pure helpers that turn the maintainer's GitHub contribution calendar into
// levels for the footer graph: validating the proxy's response, refining
// GitHub's level with the day's count, packing it for the localStorage cache,
// and spreading the days across the letters so reading the name from left to
// right reads them from oldest day to today.

import {
    ACTIVITY_FIELD_SEED,
    ACTIVITY_LEVEL_COUNT,
    ActivityCell,
    createRandom,
} from '@/components/layout/Footer/SignatureSpotlight/activityField';

// How far, as a share of one day's width, each side of a border between two
// days blends into its neighbour, so a busy day fades into a quiet one instead
// of stopping at a hard vertical line. The middle of every day keeps its level.
export const DAY_EDGE_SOFTNESS = 0.3;
// Random nudge to each square's position, in days, so a blended border
// feathers organically rather than as a perfectly straight gradient.
export const DAY_EDGE_JITTER = 0.12;
// Most a square's level is randomly dimmed (as a share), so an active day
// reads as texture inside the letters rather than a flat block of one shade.
export const DAY_TEXTURE_DEPTH = 0.3;
// How far above its GitHub level the count can lift a day: the quietest day of
// a level this year keeps that level's shade, the busiest is lifted by this
// much toward the next one. Below 1, so a level never overlaps the next.
export const COUNT_LEVEL_LIFT = 0.5;

export type CachedGithubActivity = {
    savedAt: number;
    levels: number[];
};

type ContributionDay = {
    date: string;
    count: number | null;
    level: number;
};

type CountRange = {
    lowest: number;
    highest: number;
};

function isActivityLevel(level: unknown): level is number {
    return (
        Number.isInteger(level) &&
        (level as number) >= 0 &&
        (level as number) < ACTIVITY_LEVEL_COUNT
    );
}

// A displayed level may be fractional (a level refined by its count), but it
// stays inside the range of level colours.
function isDisplayedLevel(level: unknown): level is number {
    return (
        typeof level === 'number' &&
        Number.isFinite(level) &&
        level >= 0 &&
        level <= ACTIVITY_LEVEL_COUNT - 1
    );
}

function toContributionCount(count: unknown): number | null {
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
        return null;
    }
    return count;
}

/**
 * The lowest and highest count GitHub put in each level across `days`. GitHub
 * picks its level boundaries from the whole year, so this is measured before
 * the days are trimmed to the recent ones.
 */
export function countRangesByLevel(
    days: readonly ContributionDay[]
): Map<number, CountRange> {
    const ranges = new Map<number, CountRange>();
    days.forEach(({ count, level }) => {
        if (count === null) {
            return;
        }
        const range = ranges.get(level) ?? null;
        if (!range) {
            ranges.set(level, { lowest: count, highest: count });
            return;
        }
        range.lowest = Math.min(range.lowest, count);
        range.highest = Math.max(range.highest, count);
    });
    return ranges;
}

/**
 * GitHub's `level` refined by the day's `count`: where the count sits between
 * the quietest and busiest day of that level lifts it by up to
 * COUNT_LEVEL_LIFT, so two days on the same level still differ in shade. An
 * empty day, the top level, a missing count, or a level whose days all share
 * one count keep the plain level, so a day never looks quieter than GitHub
 * shows it.
 */
export function refineLevelByCount(
    level: number,
    count: number | null,
    range: CountRange | null
): number {
    if (
        level === 0 ||
        level >= ACTIVITY_LEVEL_COUNT - 1 ||
        count === null ||
        !range ||
        range.highest <= range.lowest
    ) {
        return level;
    }
    const position = (count - range.lowest) / (range.highest - range.lowest);
    return level + COUNT_LEVEL_LIFT * Math.min(Math.max(position, 0), 1);
}

/**
 * Reads the proxy's `{ contributions: [{ date, count, level }] }` response
 * into one displayed level per day, oldest first: GitHub's level refined by
 * the count (refineLevelByCount), skipping any day after `lastDate`
 * (YYYY-MM-DD) when given. Returns null for anything malformed, so a bad or
 * changed response falls back to the decorative graph instead of throwing.
 */
export function parseContributionLevels(
    response: unknown,
    lastDate?: string
): number[] | null {
    const contributions =
        (response as { contributions?: unknown } | null)?.contributions ?? [];
    if (!Array.isArray(contributions) || contributions.length === 0) {
        return null;
    }
    const rawDays = contributions.map((day) => ({
        date: String((day as { date?: unknown } | null)?.date ?? ''),
        count: toContributionCount(
            (day as { count?: unknown } | null)?.count ?? null
        ),
        level: (day as { level?: unknown } | null)?.level ?? null,
    }));
    if (!rawDays.every((day) => isActivityLevel(day.level))) {
        return null;
    }
    const days = rawDays as ContributionDay[];
    const countRanges = countRangesByLevel(days);
    days.sort((first, second) => first.date.localeCompare(second.date));
    return days
        .filter((day) => !lastDate || day.date <= lastDate)
        .map((day) =>
            refineLevelByCount(
                day.level,
                day.count,
                countRanges.get(day.level) ?? null
            )
        );
}

/**
 * The newest `dayCount` levels (the end of the oldest-first list).
 */
export function keepRecentDays(levels: number[], dayCount: number): number[] {
    return levels.slice(-dayCount);
}

/**
 * A date as YYYY-MM-DD in local time, the format the proxy uses.
 */
export function toLocalIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Packs the levels for localStorage, rounded to two decimals (far finer than
 * the SHADES_PER_LEVEL steps the canvas draws).
 */
export function encodeCachedActivity(
    levels: number[],
    savedAt: number
): string {
    return JSON.stringify({
        savedAt,
        levels: levels.map((level) => Math.round(level * 100) / 100),
    });
}

/**
 * The inverse of encodeCachedActivity; null for a missing or corrupt entry,
 * including one in the older digit string format, so it is fetched again.
 */
export function decodeCachedActivity(
    raw: string | null
): CachedGithubActivity | null {
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw) as {
            savedAt?: unknown;
            levels?: unknown;
        };
        const savedAt = parsed?.savedAt ?? null;
        const levels = parsed?.levels ?? null;
        if (typeof savedAt !== 'number' || !Array.isArray(levels)) {
            return null;
        }
        if (levels.length === 0 || !levels.every(isDisplayedLevel)) {
            return null;
        }
        return { savedAt, levels };
    } catch {
        return null;
    }
}

/**
 * Whether a cache entry saved at `savedAt` is still within `maxAgeMs`. A time
 * stamp from the future (a changed clock) counts as stale.
 */
export function isActivityFresh(
    savedAt: number,
    now: number,
    maxAgeMs: number
): boolean {
    return savedAt <= now && now - savedAt < maxAgeMs;
}

function smoothstep(edgeStart: number, edgeEnd: number, value: number) {
    const progress = Math.min(
        Math.max((value - edgeStart) / (edgeEnd - edgeStart), 0),
        1
    );
    return progress * progress * (3 - 2 * progress);
}

/**
 * Gives every cell a level from the day under it. The days split the
 * wordmark's width into equal bands, left to right, so the oldest day lands in
 * the first letter and today in the last. Near each border the level eases
 * from one day to the next (DAY_EDGE_SOFTNESS, feathered by DAY_EDGE_JITTER),
 * and every square is dimmed by up to DAY_TEXTURE_DEPTH for texture. Seeded,
 * so the same data always draws the same graph. Levels may be fractional; the
 * canvas draws them as in-between shades.
 */
export function mapDaysToCells(
    cells: readonly ActivityCell[],
    dayLevels: readonly number[],
    seed = ACTIVITY_FIELD_SEED
): number[] {
    const levels = new Array<number>(cells.length).fill(0);
    if (dayLevels.length === 0 || cells.length === 0) {
        return levels;
    }
    const random = createRandom(seed);
    const left = Math.min(...cells.map((cell) => cell.x));
    const right = Math.max(...cells.map((cell) => cell.x));
    const width = right - left || 1;
    const lastDay = dayLevels.length - 1;
    const levelOfDay = (day: number) =>
        dayLevels[Math.min(Math.max(day, 0), lastDay)] ?? 0;

    cells.forEach((cell, index) => {
        // Where the square sits, in days, measured so each day's centre is a
        // whole number: 0.5 is the border between day 0 and day 1, and the
        // wordmark's edges are the outer borders (-0.5 and lastDay + 0.5), so
        // every day gets the same width.
        const jitter = (random() * 2 - 1) * DAY_EDGE_JITTER;
        const position =
            ((cell.x - left) / width) * dayLevels.length - 0.5 + jitter;
        const earlierDay = Math.floor(position);
        const blend = smoothstep(
            0.5 - DAY_EDGE_SOFTNESS,
            0.5 + DAY_EDGE_SOFTNESS,
            position - earlierDay
        );
        const earlierLevel = levelOfDay(earlierDay);
        const level =
            earlierLevel + (levelOfDay(earlierDay + 1) - earlierLevel) * blend;
        levels[index] = level * (1 - random() * DAY_TEXTURE_DEPTH);
    });
    return levels;
}
