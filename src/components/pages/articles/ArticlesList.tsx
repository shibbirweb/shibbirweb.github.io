'use client';

import { useSearchParams } from 'next/navigation';
import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import Pagination from '@/components/pages/articles/Pagination';
import TagFilter from '@/components/pages/articles/TagFilter';
import type { ArticleSummary } from '@/lib/posts';

interface ArticlesListProps {
    articles: ArticleSummary[];
    tags: string[];
    perPage: number;
}

export default function ArticlesList({
    articles,
    tags,
    perPage,
}: ArticlesListProps) {
    const searchParams = useSearchParams();
    const activeTag = searchParams.get('tag');
    const filtered = activeTag
        ? articles.filter((article) => article.tags.includes(activeTag))
        : articles;

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const requested = Number(searchParams.get('page'));
    const current =
        Number.isInteger(requested) && requested >= 1 && requested <= totalPages
            ? requested
            : 1;
    const start = (current - 1) * perPage;

    return (
        <>
            <TagFilter
                tags={tags}
                active={activeTag}
            />
            {filtered.length === 0 ? (
                <p className="text-foreground/70 mt-12 text-base">
                    No articles found for this tag.
                </p>
            ) : (
                <>
                    <ArticleGrid
                        articles={filtered.slice(start, start + perPage)}
                    />
                    <Pagination
                        current={current}
                        total={totalPages}
                    />
                </>
            )}
        </>
    );
}
