import { parseArticleDate } from '@/utils/articleDate';

export type DateTileParts = {
    month: string;
    day: string;
    year: string;
};

/**
 * Split an article's `YYYY-MM-DD` date into the three lines of its calendar
 * tile: a short upper-case month, a zero-padded day and the year. Read in UTC,
 * like `formatDate`, so the tile always shows the authored date. Returns `null`
 * for a missing or malformed date so the tile can be left out.
 */
export function dateTileParts(iso: string): DateTileParts | null {
    const parsed = parseArticleDate(iso);
    if (!parsed) {
        return null;
    }

    return {
        month: parsed
            .toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
            .toUpperCase(),
        day: String(parsed.getUTCDate()).padStart(2, '0'),
        year: String(parsed.getUTCFullYear()),
    };
}
