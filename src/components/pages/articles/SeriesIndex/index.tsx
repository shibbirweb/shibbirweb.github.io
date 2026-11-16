import { Suspense } from 'react';
import PageTopBar from '@/components/pages/common/PageTopBar';
import FilteredSeriesBrowser from '@/components/pages/articles/SeriesIndex/FilteredSeriesBrowser';
import SeriesBrowser from '@/components/pages/articles/SeriesIndex/SeriesBrowser';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/**
 * /articles/series: every multi-part series, newest first, as cards or rows,
 * filterable by topic. It shares the articles page's grid/list toggle, so the
 * reader's choice carries across both pages.
 */
export default function SeriesIndex({
    series,
}: {
    series: SeriesShelfEntry[];
}) {
    return (
        <main
            id="main"
            className="container mx-auto px-4 py-20 sm:py-28"
        >
            <PageTopBar
                title="Series"
                description="Multi-part guides, meant to be read in order. Each one starts at part 1."
            />

            <Suspense
                fallback={
                    <SeriesBrowser
                        series={series}
                        activeTag={null}
                    />
                }
            >
                <FilteredSeriesBrowser series={series} />
            </Suspense>
        </main>
    );
}
