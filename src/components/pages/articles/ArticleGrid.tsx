import SpotlightList from '@/components/pages/common/SpotlightList';
import ArticleCard from '@/components/pages/articles/ArticleCard';
import { cn } from '@/utils/cn';
import type { SeriesTotals } from '@/utils/seriesTotals';
import type { ArticleSummary } from '@/lib/posts';

/** Cards in the grid's widest row (lg:grid-cols-3): the covers above the fold. */
export const firstRowCoverCount = 3;

export default function ArticleGrid({
    articles,
    className,
    compact = false,
    eagerCoverCount = 0,
    seriesTotals,
}: {
    articles: ArticleSummary[];
    className?: string;
    compact?: boolean;
    /**
     * How many leading cards load their cover eagerly. A page whose grid is
     * above the fold sets its first row, since that cover is the largest paint.
     */
    eagerCoverCount?: number;
    /** Series name to published-part count, for each card's "Part N of M" label. */
    seriesTotals?: SeriesTotals;
}) {
    return (
        <SpotlightList
            className={cn(
                'mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
                className
            )}
        >
            {articles.map((article, index) => (
                <ArticleCard
                    key={article.slug}
                    article={article}
                    compact={compact}
                    eagerCover={index < eagerCoverCount}
                    seriesTotal={
                        article.series
                            ? seriesTotals?.[article.series.name]
                            : undefined
                    }
                />
            ))}
        </SpotlightList>
    );
}
