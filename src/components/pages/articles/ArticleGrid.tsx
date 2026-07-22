import ArticleCard from '@/components/pages/articles/ArticleCard';
import { cn } from '@/utils/cn';
import type { SeriesTotals } from '@/utils/seriesTotals';
import type { ArticleSummary } from '@/lib/posts';

export default function ArticleGrid({
    articles,
    className,
    compact = false,
    seriesTotals,
}: {
    articles: ArticleSummary[];
    className?: string;
    compact?: boolean;
    /** Series name to published-part count, for each card's "Part N of M" label. */
    seriesTotals?: SeriesTotals;
}) {
    return (
        <ul
            className={cn(
                'mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
                className
            )}
        >
            {articles.map((article) => (
                <ArticleCard
                    key={article.slug}
                    article={article}
                    compact={compact}
                    seriesTotal={
                        article.series
                            ? seriesTotals?.[article.series.name]
                            : undefined
                    }
                />
            ))}
        </ul>
    );
}
