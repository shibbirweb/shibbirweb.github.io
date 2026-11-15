import type { ArticleSummary } from '@/lib/posts';

/**
 * The "Part N of M" label for an article in a series, or `undefined` for a
 * standalone one. Falls back to "Part N" when the published total is unknown
 * or one, matching SeriesBadge on the articles page.
 */
export function seriesPartLabel(
    series: ArticleSummary['series'],
    total?: number
): string | undefined {
    if (!series) {
        return undefined;
    }
    if (total && total > 1) {
        return `Part ${series.order} of ${total}`;
    }

    return `Part ${series.order}`;
}
