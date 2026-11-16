import type { ArticleSummary } from '@/lib/posts';

/** One topic (tag) and how many published articles carry it. */
export interface TopicCount {
    tag: string;
    count: number;
}

/**
 * Every tag with its article count, the busiest topics first and ties in
 * alphabetical order, so a visitor sees where most of the writing is before the
 * one-off tags.
 */
export function buildTopicCounts(
    articles: readonly Pick<ArticleSummary, 'tags'>[]
): TopicCount[] {
    const counts = new Map<string, number>();

    for (const article of articles) {
        for (const tag of article.tags) {
            counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
    }

    return [...counts]
        .map(([tag, count]) => ({ tag, count }))
        .sort(
            (first, second) =>
                second.count - first.count ||
                first.tag.localeCompare(second.tag)
        );
}
