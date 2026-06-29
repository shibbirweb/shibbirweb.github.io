import Link from 'next/link';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import type { ArticleSeries } from '@/lib/posts';

/**
 * A tracker for multi-part tutorials: it names the series, shows "Part N of M",
 * and lists every part as a stepper so the reader can jump across the set and
 * always see where this article sits. Other parts link out; the current one is
 * marked, not linked.
 */
export default function SeriesNav({
    series,
    currentSlug,
    accentColors,
    className,
}: {
    series: ArticleSeries;
    currentSlug: string;
    accentColors: readonly [string, string];
    className?: string;
}) {
    const currentIndex = series.parts.findIndex(
        (part) => part.slug === currentSlug
    );
    const position = currentIndex + 1;

    return (
        <section
            aria-label={`Series: ${series.name}`}
            style={accentStyle(accentColors)}
            className={cn(
                'border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-5 sm:p-6',
                className
            )}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-foreground/45 text-xs font-semibold tracking-[0.12em] uppercase">
                    Part {position} of {series.parts.length}
                </p>
                <p className="text-foreground/55 text-xs">Series</p>
            </div>
            <h2 className="mt-1 text-base font-bold sm:text-lg">
                {series.name}
            </h2>
            <ol className="mt-4 space-y-1">
                {series.parts.map((part, index) => {
                    const stepLabel = (
                        <>
                            <span
                                aria-hidden
                                className={cn(
                                    'flex size-6 flex-none items-center justify-center rounded-full text-xs font-semibold',
                                    part.isCurrent
                                        ? 'bg-linear-to-br from-[var(--accent-from)] to-[var(--accent-to)] text-white'
                                        : 'border-foreground/15 text-foreground/55 border'
                                )}
                            >
                                {index + 1}
                            </span>
                            <span className="leading-snug">{part.title}</span>
                        </>
                    );

                    return (
                        <li key={part.slug}>
                            {part.isCurrent ? (
                                <span
                                    aria-current="page"
                                    className="text-foreground flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-semibold"
                                >
                                    {stepLabel}
                                </span>
                            ) : (
                                <Link
                                    href={`/articles/${part.slug}`}
                                    className="text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors"
                                >
                                    {stepLabel}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
