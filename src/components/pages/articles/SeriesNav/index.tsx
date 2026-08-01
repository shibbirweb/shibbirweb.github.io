import Link from 'next/link';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import SpotlightGroup from '@/components/pages/common/SpotlightGroup';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import styles from '@/components/pages/articles/SeriesNav/SeriesNav.module.css';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import type { ArticleSeries } from '@/lib/posts';

/**
 * A tracker for multi-part tutorials: it names the series, shows "Part N of M",
 * and lists every part as a stepper so the reader can jump across the set and
 * always see where this article sits. Other parts link out; the current one is
 * marked, not linked.
 *
 * It carries the site's accent bloom like every other panel surface: a faint wash
 * at rest that blooms on hover, plus the cursor spotlight and lit edge, all in
 * SeriesNav.module.css and tinted with the article's cover accent. The
 * SpotlightGroup wrapper owns the pointer listener and is `contents`, so it
 * generates no box and leaves the layout exactly as it was.
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
        <SpotlightGroup className="contents">
            <section
                {...spotlightSurfaceProps}
                aria-label={`Series: ${series.name}`}
                style={accentStyle(accentColors)}
                className={cn(
                    styles.panel,
                    'border-foreground/10 bg-foreground/[0.02] relative isolate rounded-2xl border p-5 sm:p-6',
                    className
                )}
            >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-foreground/70 text-xs font-semibold tracking-[0.12em] uppercase">
                        Part {position} of {series.parts.length}
                    </p>
                    <p className="text-foreground/70 text-xs">Series</p>
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
                                            : 'border-foreground/15 text-foreground/70 border'
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <span className="leading-snug">
                                    {part.title}
                                </span>
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

                <SpotlightBorder className={styles.spotlightBorder} />
            </section>
        </SpotlightGroup>
    );
}
