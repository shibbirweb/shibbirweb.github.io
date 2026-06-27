'use client';

import { useSearchParams } from 'next/navigation';
import ArticleGrid from './ArticleGrid';
import Pagination from './Pagination';
import type { ArticleSummary } from '@/lib/posts';

interface ArticlesListProps {
    articles: ArticleSummary[];
    perPage: number;
}

export default function ArticlesList({ articles, perPage }: ArticlesListProps) {
    const searchParams = useSearchParams();
    const totalPages = Math.max(1, Math.ceil(articles.length / perPage));
    const requested = Number(searchParams.get('page'));
    const current =
        Number.isInteger(requested) && requested >= 1 && requested <= totalPages
            ? requested
            : 1;
    const start = (current - 1) * perPage;

    return (
        <>
            <ArticleGrid articles={articles.slice(start, start + perPage)} />
            <Pagination
                current={current}
                total={totalPages}
            />
        </>
    );
}
