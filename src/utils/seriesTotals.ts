import type { ArticleSummary } from '@/lib/posts';

/** A map of series name to the number of published parts in that series. */
export type SeriesTotals = Record<string, number>;

/**
 * Count how many published articles belong to each series, keyed by series name.
 * `ArticleSummary` carries only a part's own `order`, not the size of its set, so
 * the total for a "Part N of M" label has to be derived from the full corpus.
 * Pure and list-driven, so it is safe to call on the server or in a client
 * component that already holds the article list.
 */
export function buildSeriesTotals(
    articles: readonly Pick<ArticleSummary, 'series'>[]
): SeriesTotals {
    const totals: SeriesTotals = {};

    for (const article of articles) {
        const name = article.series?.name;
        if (name) {
            totals[name] = (totals[name] ?? 0) + 1;
        }
    }

    return totals;
}
