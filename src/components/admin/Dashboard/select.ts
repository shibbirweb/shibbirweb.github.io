import type { ArticleListItem } from '@/lib/admin/types';
import type { DashboardFilters } from '@/components/admin/Dashboard/types';

/** The searchable text blob for one article (title, slug, tags, etc.). */
function haystack(item: ArticleListItem): string {
    return [
        item.title,
        item.description,
        item.slug,
        item.category ?? '',
        item.status,
        ...item.tags,
    ]
        .join(' ')
        .toLowerCase();
}

function matchesSearch(item: ArticleListItem, search: string): boolean {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;
    const text = haystack(item);
    return terms.every((term) => text.includes(term));
}

/** Apply the dashboard's search, filters, and sort to the article list. */
export function selectArticles(
    articles: ArticleListItem[],
    filters: DashboardFilters
): ArticleListItem[] {
    const filtered = articles.filter((item) => {
        if (filters.status !== 'all' && item.status !== filters.status)
            return false;
        if (filters.category !== 'all' && item.category !== filters.category)
            return false;
        if (filters.tag !== 'all' && !item.tags.includes(filters.tag))
            return false;
        return matchesSearch(item, filters.search);
    });

    const byDate = (item: ArticleListItem) => item.date || item.lastModified;

    return [...filtered].sort((a, b) => {
        switch (filters.sort) {
            case 'oldest':
                return byDate(a) < byDate(b) ? -1 : byDate(a) > byDate(b) ? 1 : 0;
            case 'updated':
                return a.lastModified < b.lastModified ? 1 : -1;
            case 'title':
                return a.title.localeCompare(b.title);
            case 'reading':
                return b.readingMinutes - a.readingMinutes;
            case 'recent':
            default:
                return byDate(a) < byDate(b) ? 1 : byDate(a) > byDate(b) ? -1 : 0;
        }
    });
}
