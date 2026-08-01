import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import Pagination from '@/components/pages/articles/Pagination';
import type { ArticleSummary } from '@/lib/posts';

/**
 * What sits below the search field, in precedence order: a prompt before anything
 * is typed, the paginated grid when the query matched, and an empty-state line when
 * it did not. Separate early returns rather than one expression, so each branch is
 * a whole element rather than a limb of a nested ternary.
 */
export default function SearchResultsBody({
    query,
    results,
    perPage,
    current,
    totalPages,
    createHref,
}: {
    query: string;
    results: ArticleSummary[];
    perPage: number;
    current: number;
    totalPages: number;
    createHref: (page: number) => string;
}) {
    if (query.length === 0) {
        return (
            <p className="text-foreground/70 mt-12 text-base">
                Open search to find an article by its title or a tag.
            </p>
        );
    }

    if (results.length === 0) {
        return (
            <p className="text-foreground/70 mt-12 text-base">
                Nothing matched. Try a different title or tag.
            </p>
        );
    }

    const start = (current - 1) * perPage;
    return (
        <>
            <ArticleGrid articles={results.slice(start, start + perPage)} />
            <Pagination
                current={current}
                total={totalPages}
                createHref={createHref}
            />
        </>
    );
}
