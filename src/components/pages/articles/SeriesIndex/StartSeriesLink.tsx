import Link from 'next/link';
import ChevronIcon from '@/components/icons/chevron';
import { cn } from '@/utils/cn';

/** The way into a series: its first part, in the series' accent gradient. */
export default function StartSeriesLink({
    firstPartSlug,
    seriesName,
    className,
}: {
    firstPartSlug: string;
    seriesName: string;
    className?: string;
}) {
    return (
        <Link
            href={`/articles/${firstPartSlug}`}
            aria-label={`Start with part 1 of ${seriesName}`}
            className={cn(
                'focus-ring group inline-flex min-h-11 items-center gap-2 rounded-full bg-linear-to-br from-[var(--accent-from)] to-[var(--accent-to)] px-5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md',
                className
            )}
        >
            Start with part 1
            <ChevronIcon
                aria-hidden
                className="size-4 rotate-90 transition-transform group-hover:translate-x-0.5"
            />
        </Link>
    );
}
