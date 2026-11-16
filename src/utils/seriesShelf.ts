import type { ArticleSummary } from '@/lib/posts';

/** One part of a series as the articles index lists it. */
export interface SeriesShelfPart {
    slug: string;
    title: string;
    cover: string;
}

/** A series on the articles index: its parts in reading order and their totals. */
export interface SeriesShelfEntry {
    name: string;
    parts: SeriesShelfPart[];
    readingMinutes: number;
    /** The first part's cover colours, so the card matches where the reader starts. */
    accentColors: readonly [string, string];
    /** When any part was last published or updated: the newest series comes first. */
    latestDate: string;
    /** Every part's tags, the most shared first, then in reading order. */
    tags: string[];
    /** Every part's tech stack, in reading order without repeats. */
    tech: string[];
}

type SeriesArticle = Pick<
    ArticleSummary,
    | 'slug'
    | 'title'
    | 'date'
    | 'updated'
    | 'cover'
    | 'readingMinutes'
    | 'coverColors'
    | 'series'
    | 'tags'
> & { tech?: string[] };

/**
 * Groups the published articles into their series, parts in reading order, with
 * the most recently published or updated series first. Standalone articles are
 * left out.
 */
export function buildSeriesShelf(
    articles: readonly SeriesArticle[]
): SeriesShelfEntry[] {
    const groups = new Map<string, SeriesArticle[]>();

    for (const article of articles) {
        const name = article.series?.name;
        if (name) {
            groups.set(name, [...(groups.get(name) ?? []), article]);
        }
    }

    return [...groups]
        .map(([name, members]) => {
            const ordered = [...members].sort(
                (first, second) =>
                    (first.series?.order ?? 0) - (second.series?.order ?? 0)
            );

            return {
                name,
                parts: ordered.map(({ slug, title, cover }) => ({
                    slug,
                    title,
                    cover,
                })),
                readingMinutes: ordered.reduce(
                    (total, part) => total + part.readingMinutes,
                    0
                ),
                accentColors: ordered[0].coverColors,
                latestDate: ordered
                    .map((part) => part.updated ?? part.date)
                    .sort()
                    .at(-1) as string,
                tags: mostSharedFirst(ordered.map((part) => part.tags)),
                tech: [...new Set(ordered.flatMap((part) => part.tech ?? []))],
            };
        })
        .sort((first, second) =>
            second.latestDate.localeCompare(first.latestDate)
        );
}

/**
 * The union of several tag lists, tags that more lists share first, ties kept in
 * the order they first appear. A series' common topics lead its tag row.
 */
function mostSharedFirst(tagLists: readonly string[][]): string[] {
    const counts = new Map<string, number>();

    for (const tag of tagLists.flat()) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }

    // Map keeps first-insertion order and Array.prototype.sort is stable, so
    // equal counts stay in the order they first appeared.
    return [...counts.keys()].sort(
        (first, second) => (counts.get(second) ?? 0) - (counts.get(first) ?? 0)
    );
}
