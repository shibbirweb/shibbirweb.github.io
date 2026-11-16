import Link from 'next/link';
import SeriesLink from '@/components/pages/articles/ArticlesBrowse/SeriesLink';
import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/**
 * The most recently updated series as one pill that opens its part 1, plus a
 * link to every series on /articles/series. It adds no box of its own
 * (`contents`), so its pieces wrap in the browse bar's flex row together with
 * the Filters button: one line on desktop, and on a phone the "All series" link
 * shares the last line with Filters.
 */
export default function LatestSeries({
    series,
    seriesCount,
}: {
    series: SeriesShelfEntry;
    seriesCount: number;
}) {
    return (
        <div className="contents">
            <h2
                id="latest-series"
                className={cn(
                    monoTextClassName,
                    'text-foreground/55 text-xs font-semibold tracking-[0.14em] uppercase'
                )}
            >
                Latest series
            </h2>
            <SeriesLink series={series} />
            <Link
                href="/articles/series"
                className="focus-ring text-foreground/70 hover:text-foreground decoration-foreground/25 hover:decoration-foreground inline-flex min-h-11 items-center rounded-full px-1 text-sm font-medium underline underline-offset-4 sm:min-h-9"
            >
                All series ({seriesCount})
            </Link>
        </div>
    );
}
