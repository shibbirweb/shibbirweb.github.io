import Link from 'next/link';
import ArticlesResults from '@/components/pages/articles/ArticlesResults';
import ArticlesToolbar from '@/components/pages/articles/ArticlesToolbar';
import ClearSearchLink from '@/components/pages/articles/SearchResults/ClearSearchLink';
import Pagination from '@/components/pages/articles/Pagination';
import SearchResultsLabel from '@/components/pages/articles/SearchResults/SearchResultsLabel';
import type { SeriesTotals } from '@/utils/seriesTotals';
import type { ArticleSummary } from '@/lib/posts';

/**
 * What sits below the search field, in precedence order: a prompt before anything
 * is typed, the results (a toolbar with the count and the grid/list toggle, then the
 * paginated grid or list) when the query matched, and the count with an empty-state
 * line when it did not. Every branch offers a way back to all articles. Separate
 * early returns rather than one expression, so each branch is a whole element
 * rather than a limb of a nested ternary.
 */
export default function SearchResultsBody({
    query,
    results,
    seriesTotals,
    perPage,
    current,
    totalPages,
    createHref,
}: {
    query: string;
    results: ArticleSummary[];
    seriesTotals: SeriesTotals;
    perPage: number;
    current: number;
    totalPages: number;
    createHref: (page: number) => string;
}) {
    if (query.length === 0) {
        return (
            <p className="text-foreground/70 mt-12 text-base">
                Open search to find an article by its title or a tag, or{' '}
                <Link
                    href="/articles"
                    className="focus-ring text-foreground decoration-foreground/30 hover:decoration-foreground rounded-sm underline underline-offset-4"
                >
                    browse all articles
                </Link>
                .
            </p>
        );
    }

    if (results.length === 0) {
        return (
            <>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <SearchResultsLabel
                        count={0}
                        query={query}
                    />
                    <ClearSearchLink />
                </div>
                <p className="text-foreground/70 mt-6 text-base">
                    Nothing matched. Try a different title or tag.
                </p>
            </>
        );
    }

    const start = (current - 1) * perPage;
    return (
        <>
            <ArticlesToolbar
                summary={
                    <div className="flex flex-wrap items-center gap-3">
                        <SearchResultsLabel
                            count={results.length}
                            query={query}
                        />
                        <ClearSearchLink />
                    </div>
                }
            />
            <ArticlesResults
                articles={results.slice(start, start + perPage)}
                seriesTotals={seriesTotals}
            />
            <Pagination
                current={current}
                total={totalPages}
                createHref={createHref}
            />
        </>
    );
}
