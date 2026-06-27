import ArticleCard from './ArticleCard';
import { cn } from '@/utils/cn';
import type { ArticleSummary } from '@/lib/posts';

export default function ArticleGrid({
    articles,
    className,
}: {
    articles: ArticleSummary[];
    className?: string;
}) {
    return (
        <ul
            className={cn(
                'mt-12 grid grid-cols-1 gap-6 md:grid-cols-2',
                className
            )}
        >
            {articles.map((article) => (
                <ArticleCard
                    key={article.slug}
                    article={article}
                />
            ))}
        </ul>
    );
}
