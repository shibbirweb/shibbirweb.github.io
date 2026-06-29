'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';
import Pagination from '@/components/pages/articles/Pagination';
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
    const start = (current - 1) * perPage;
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
                        {results.length === 0
                            ? 'No articles found for '
                            : `${results.length} ${
                                  results.length === 1 ? 'article' : 'articles'
                              } found for `}
                        <span className="text-foreground font-medium">
                            “{query}”
                        </span>
                    </p>
                )}
            </div>

            {query.length === 0 ? (
                <p className="text-foreground/60 mt-12 text-base">
                    Open search to find an article by its title or a tag.
                </p>
            ) : results.length > 0 ? (
                <>
                    <ArticleGrid articles={results.slice(start, start + perPage)} />
                    <Pagination
                        current={current}
                        total={totalPages}
                        createHref={createHref}
                    />
                </>
            ) : (
                <p className="text-foreground/60 mt-12 text-base">
                    Nothing matched. Try a different title or tag.
                </p>
            )}
        </div>
    );
}
