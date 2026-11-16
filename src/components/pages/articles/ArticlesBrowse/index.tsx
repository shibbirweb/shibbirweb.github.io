import FilterBar from '@/components/pages/articles/ArticlesBrowse/FilterBar';
import LatestSeries from '@/components/pages/articles/ArticlesBrowse/LatestSeries';
import { articleNoun } from '@/components/pages/articles/ArticlesBrowse/countNoun';
import { buildSeriesShelf } from '@/utils/seriesShelf';
import { buildTopicCounts } from '@/utils/topicCounts';
import type { ArticleSummary } from '@/lib/posts';

/**
 * The top of the articles index on one slim line: the latest series with a link
 * to all of them, and the Filters button with the article topics behind it.
 */
export default function ArticlesBrowse({
    articles,
    activeTag,
}: {
    articles: ArticleSummary[];
    activeTag: string | null;
}) {
    const series = buildSeriesShelf(articles);

    return (
        <FilterBar
            leading={
                series.length > 0 && (
                    <LatestSeries
                        series={series[0]}
                        seriesCount={series.length}
                    />
                )
            }
            topics={buildTopicCounts(articles)}
            totalCount={articles.length}
            activeTag={activeTag}
            basePath="/articles"
            countNoun={articleNoun}
            label="Filter articles by tag"
            className="mt-8"
        />
    );
}
