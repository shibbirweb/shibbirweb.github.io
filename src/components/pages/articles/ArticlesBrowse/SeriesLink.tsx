import Link from 'next/link';
import ChevronIcon from '@/components/icons/chevron';
import { monoTextClassName } from '@/components/pages/common/monoText';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/**
 * A series as one slim pill that opens its first part. The dot carries the first
 * part's cover colours, the same pair the series tracker inside the article uses.
 */
export default function SeriesLink({ series }: { series: SeriesShelfEntry }) {
    const partCount = series.parts.length;

    return (
        <Link
            href={`/articles/${series.parts[0].slug}`}
            style={accentStyle(series.accentColors)}
            aria-label={`${series.name}, ${partCount} ${partCount === 1 ? 'part' : 'parts'}, start with part 1`}
            className="focus-ring group border-foreground/15 text-foreground/80 hover:border-foreground/50 hover:text-foreground inline-flex min-h-11 items-center gap-2.5 rounded-full border py-1 pr-3 pl-3.5 text-sm transition-colors sm:min-h-9"
        >
            <span
                aria-hidden
                className="size-2.5 flex-none rounded-full bg-linear-to-br from-[var(--accent-from)] to-[var(--accent-to)]"
            />
            <span className="font-medium">{series.name}</span>
            <span
                className={cn(monoTextClassName, 'text-foreground/45 text-xs')}
            >
                {partCount} {partCount === 1 ? 'part' : 'parts'}
            </span>
            <ChevronIcon
                aria-hidden
                className="text-foreground/45 group-hover:text-foreground size-3.5 rotate-90 transition-transform group-hover:translate-x-0.5"
            />
        </Link>
    );
}
