'use client';

import { useSearchParams } from 'next/navigation';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';
import type { ArticleSummary } from '@/lib/posts';

/**
 * The search button on /articles/search, pre-filled with the active `?q=` so the
 * search can be refined. It reads the query in the browser (the page is static),
 * so ArticlesSearch renders it inside Suspense with an empty search as fallback.
 */
export default function QueryArticleSearch({
    articles,
    className,
}: {
    articles: ArticleSummary[];
    className?: string;
}) {
    const query = (useSearchParams().get('q') ?? '').trim();

    return (
        <ArticleSearch
            articles={articles}
            initialQuery={query}
            className={className}
        />
    );
}
