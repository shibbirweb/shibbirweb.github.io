import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/** "2 parts · 16 min read · Updated Nov 16, 2026" in the mono meta style. */
export default function SeriesMeta({
    series,
    className,
}: {
    series: SeriesShelfEntry;
    className?: string;
}) {
    const partCount = series.parts.length;

    return (
        <p
            className={cn(
                monoTextClassName,
                'text-foreground/60 text-xs tracking-wider uppercase',
                className
            )}
        >
            {partCount} {partCount === 1 ? 'part' : 'parts'} ·{' '}
            {series.readingMinutes} min read · Updated{' '}
            <time dateTime={series.latestDate}>
                {formatDate(series.latestDate)}
            </time>
        </p>
    );
}
