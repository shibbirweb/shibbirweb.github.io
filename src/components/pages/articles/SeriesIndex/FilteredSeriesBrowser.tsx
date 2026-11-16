'use client';

import { useSearchParams } from 'next/navigation';
import SeriesBrowser from '@/components/pages/articles/SeriesIndex/SeriesBrowser';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/**
 * Reads ?tag= in the browser (the page is static, so the server never sees it)
 * and hands it to SeriesBrowser. SeriesIndex renders it inside Suspense, with
 * the unfiltered browser as the pre-rendered fallback.
 */
export default function FilteredSeriesBrowser({
    series,
}: {
    series: SeriesShelfEntry[];
}) {
    const activeTag = useSearchParams().get('tag');

    return (
        <SeriesBrowser
            series={series}
            activeTag={activeTag}
        />
    );
}
