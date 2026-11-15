import SpotlightList from '@/components/pages/common/SpotlightList';
import ArticleRow from '@/components/pages/articles/ArticleRow';
import { cn } from '@/utils/cn';
import type { SeriesTotals } from '@/utils/seriesTotals';
import type { ArticleSummary } from '@/lib/posts';

/**
 * Articles as a stack of compact rows (ArticleRow): the list layout of the
 * articles page and the home Latest Articles teaser. The list counterpart of
 * ArticleGrid, taking the same props.
 */
export default function ArticleRowList({
    articles,
    className,
    seriesTotals,
}: {
    articles: ArticleSummary[];
    className?: string;
    /** Series name to published-part count, for each row's "Part N of M" label. */
    seriesTotals?: SeriesTotals;
}) {
    return (
        <SpotlightList className={cn('mt-6 flex flex-col gap-3', className)}>
            {articles.map((article) => (
                <ArticleRow
                    key={article.slug}
                    article={article}
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
