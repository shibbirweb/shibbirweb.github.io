import CheckIcon from '@/components/icons/check';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import SpotlightGroup from '@/components/pages/common/SpotlightGroup';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import styles from '@/components/pages/articles/WhatYoullLearn/WhatYoullLearn.module.css';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';

/**
 * A boxed summary of the key takeaways, drawn from the article's `learn`
 * frontmatter, so a reader can decide in seconds whether the piece is for them.
 * The card and its check marks pick up the article's cover accent, and it is lit by
 * the cursor like the site's other card surfaces (a faint wash plus a lit edge, both
 * in WhatYoullLearn.module.css).
 *
 * The SpotlightGroup wrapper owns the pointer listener and is `contents`, so it
 * generates no box and leaves the layout exactly as it was; the section itself is the
 * lit surface.
 */
export default function WhatYoullLearn({
    items,
    accentColors,
    className,
}: {
    items: string[];
    accentColors: readonly [string, string];
    className?: string;
}) {
    if (items.length === 0) return null;

    return (
        <SpotlightGroup className="contents">
            <section
                {...spotlightSurfaceProps}
                aria-labelledby="what-youll-learn"
                style={accentStyle(accentColors)}
                className={cn(
                    styles.card,
                    'border-foreground/10 relative isolate rounded-2xl border p-6 sm:p-8',
                    className
                )}
            >
                {/* A faint accent wash bleeds in from the leading edge of the card.
                    The bar has square corners, so it needs clipping to the card's
                    rounded shape; that clip lives on this wrapper rather than on the
                    card itself, because clipping the card would swallow the lit
                    border ring, which sits a pixel outside the padding box. The
                    radius is the card's less the 1px border the clip sits inside,
                    which is what the card's own overflow clip used to produce. */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[calc(1rem-1px)]"
                >
                    <span className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-[var(--accent-from)] to-[var(--accent-to)]" />
                </span>

                <h2
                    id="what-youll-learn"
                    className="text-foreground/70 text-xs font-semibold tracking-[0.12em] uppercase"
                >
                    What you&rsquo;ll learn
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {items.map((item) => (
                        <li
                            key={item}
                            className="flex items-start gap-3"
                        >
                            <CheckIcon className="mt-0.5 size-4 flex-none text-[var(--accent-to)]" />
                            <span className="text-foreground/80 text-sm leading-relaxed">
                                {item}
                            </span>
                        </li>
                    ))}
                </ul>

                <SpotlightBorder
                    className={styles.spotlightBorder}
                />
            </section>
        </SpotlightGroup>
    );
}
