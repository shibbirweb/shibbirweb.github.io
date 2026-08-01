'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';
import SearchResultsBody from '@/components/pages/articles/SearchResults/SearchResultsBody';
import { resolveResultsLabel } from '@/components/pages/articles/SearchResults/resultsLabel';
import { searchArticles } from '@/utils/searchArticles';
import { buildPageHref } from '@/utils/pageHref';
import type { ArticleSummary } from '@/lib/posts';

/**
 * Reads the `?q=` query string client-side (the page itself is statically
 * exported) and renders the matching articles, paginated like the index. The
 * search trigger stays available, pre-filled with the active query, so the
 * search can be refined.
 */
export default function SearchResults({
    articles,
    perPage,
}: {
    articles: ArticleSummary[];
    perPage: number;
}) {
    const searchParams = useSearchParams();
    const query = (searchParams.get('q') ?? '').trim();

    const results = useMemo(
        () => searchArticles(articles, query).map((result) => result.article),
        [articles, query]
    );

    const totalPages = Math.max(1, Math.ceil(results.length / perPage));
    const requested = Number(searchParams.get('page'));
    const current =
        Number.isInteger(requested) && requested >= 1 && requested <= totalPages
            ? requested
            : 1;
    const createHref = (page: number) =>
        buildPageHref('/articles/search', searchParams, page);

    return (
        <div className="mt-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <ArticleSearch
                    articles={articles}
                    initialQuery={query}
                />
                {query.length > 0 && (
                    <p className="text-foreground/70 text-sm">
                        {resolveResultsLabel(results.length)}
                        <span className="text-foreground font-medium">
                            “{query}”
                        </span>
                    </p>
                )}
            </div>

            <SearchResultsBody
                query={query}
                results={results}
                perPage={perPage}
                current={current}
                totalPages={totalPages}
                createHref={createHref}
            />
        </div>
    );
}
