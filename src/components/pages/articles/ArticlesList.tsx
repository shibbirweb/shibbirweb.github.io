'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticlesResults from '@/components/pages/articles/ArticlesResults';
import ArticleCount from '@/components/pages/articles/ArticleCount';
import ArticlesToolbar from '@/components/pages/articles/ArticlesToolbar';
import Pagination from '@/components/pages/articles/Pagination';
import ArticlesBrowse from '@/components/pages/articles/ArticlesBrowse';
import { buildPageHref } from '@/utils/pageHref';
import { buildSeriesTotals } from '@/utils/seriesTotals';
import type { ArticleSummary } from '@/lib/posts';

interface ArticlesListProps {
    articles: ArticleSummary[];
    perPage: number;
}

export default function ArticlesList({ articles, perPage }: ArticlesListProps) {
    const searchParams = useSearchParams();
    const activeTag = searchParams.get('tag');
    const filtered = activeTag
        ? articles.filter((article) => article.tags.includes(activeTag))
        : articles;

    // Count parts from the full set, not the filtered/paged slice, so "Part N of
    // M" stays correct even when a tag filter hides some parts of a series.
    const seriesTotals = useMemo(() => buildSeriesTotals(articles), [articles]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const requested = Number(searchParams.get('page'));
    const current =
        Number.isInteger(requested) && requested >= 1 && requested <= totalPages
            ? requested
            : 1;
    const start = (current - 1) * perPage;
    // Keep the active tag on the URL when paging, so pagination stays scoped to
    // the filtered set instead of dropping back to all articles.
    const createHref = (page: number) =>
        buildPageHref('/articles', searchParams, page);

    return (
        <>
            <ArticlesBrowse
                articles={articles}
                activeTag={activeTag}
            />
            {filtered.length === 0 ? (
                <p className="text-foreground/70 mt-12 text-base">
                    No articles found for this tag.
                </p>
            ) : (
                <>
                    <h2 className="sr-only">Article list</h2>
                    <ArticlesToolbar
                        summary={<ArticleCount count={filtered.length} />}
                    />
                    <ArticlesResults
                        articles={filtered.slice(start, start + perPage)}
                        seriesTotals={seriesTotals}
                    />
                    <Pagination
                        current={current}
                        total={totalPages}
                        createHref={createHref}
                    />
                </>
            )}
        </>
    );
}
