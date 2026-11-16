import SpotlightList from '@/components/pages/common/SpotlightList';
import { monoTextClassName } from '@/components/pages/common/monoText';
import FilterBar from '@/components/pages/articles/ArticlesBrowse/FilterBar';
import {
    formatCount,
    seriesNoun,
} from '@/components/pages/articles/ArticlesBrowse/countNoun';
import ArticlesViewToggle from '@/components/pages/articles/ArticlesViewToggle';
import SeriesCard from '@/components/pages/articles/SeriesIndex/SeriesCard';
import SeriesRow from '@/components/pages/articles/SeriesIndex/SeriesRow';
import styles from '@/components/pages/articles/SeriesIndex/SeriesIndex.module.css';
import { cn } from '@/utils/cn';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';
import { buildTopicCounts } from '@/utils/topicCounts';

/** Cards in the grid's widest row: the cover decks above the fold. */
const FIRST_ROW_CARD_COUNT = 3;

/**
 * The filterable part of /articles/series: one bar with the count, Filters and
 * the layout toggle, then the series as cards and as rows. A topic keeps every series that
 * has a part tagged with it. Both layouts ship and the saved choice picks one
 * with CSS (SeriesIndex.module.css), so nothing flashes.
 */
export default function SeriesBrowser({
    series,
    activeTag,
}: {
    series: SeriesShelfEntry[];
    activeTag: string | null;
}) {
    const shown = activeTag
        ? series.filter((entry) => entry.tags.includes(activeTag))
        : series;

    return (
        <>
            <FilterBar
                leading={
                    <p
                        className={cn(
                            monoTextClassName,
                            'text-foreground/60 text-xs tracking-wider uppercase'
                        )}
                    >
                        {formatCount(shown.length, seriesNoun)}
                    </p>
                }
                trailing={<ArticlesViewToggle />}
                topics={buildTopicCounts(series)}
                totalCount={series.length}
                activeTag={activeTag}
                basePath="/articles/series"
                countNoun={seriesNoun}
                label="Filter series by tag"
                className="mt-8"
            />

            {shown.length === 0 ? (
                <p className="text-foreground/70 mt-12 text-base">
                    No series found for this topic.
                </p>
            ) : (
                <>
                    <SpotlightList
                        className={cn(
                            styles.gridView,
                            'mt-6 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                        )}
                    >
                        {shown.map((entry, index) => (
                            <SeriesCard
                                key={entry.name}
                                series={entry}
                                eagerCover={index < FIRST_ROW_CARD_COUNT}
                            />
                        ))}
                    </SpotlightList>
                    <SpotlightList
                        className={cn(
                            styles.listView,
                            'mt-6 flex flex-col gap-3'
                        )}
                    >
                        {shown.map((entry) => (
                            <SeriesRow
                                key={entry.name}
                                series={entry}
                            />
                        ))}
                    </SpotlightList>
                </>
            )}
        </>
    );
}
