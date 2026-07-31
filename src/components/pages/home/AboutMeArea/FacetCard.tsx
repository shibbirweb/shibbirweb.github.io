import type { CSSProperties } from 'react';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import { Facet } from '@/components/pages/home/AboutMeArea/contents';
import styles from '@/components/pages/home/AboutMeArea/FacetCard.module.css';
import { cn } from '@/utils/cn';

// One facet card: an accent-dotted title and a one-line statement. On hover a
// soft accent gradient grows in from the corner the connector line attaches to,
// matching the line's colour and direction. `persistent` keeps a faint tint for
// the bento tiles, which can't be hovered on touch.
//
// On top of that the card is lit by the cursor, matching the project cards and
// skill tiles: a faint wash plus a lit edge, both centred on the pointer and
// driven by the --pointer-x/y the enclosing spotlight group writes here.
export default function FacetCard({
    facet,
    className,
    persistent = false,
}: {
    facet: Facet;
    className?: string;
    persistent?: boolean;
}) {
    return (
        <div
            {...spotlightSurfaceProps}
            className={cn(
                styles.card,
                persistent && styles.persistent,
                'border-foreground/10 hover:border-foreground/30 bg-background z-10 rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg',
                facet.placementClassName,
                className
            )}
            style={
                {
                    '--facet-accent': facet.accent,
                    '--facet-origin': facet.origin,
                } as CSSProperties
            }
        >
            <span
                aria-hidden
                className={styles.glow}
            />

            {/* Before the content, so the wash paints over the card's opaque
                background but under the text. */}
            <span
                aria-hidden
                className={styles.spotlight}
            />

            <div className="relative">
                <div className="flex items-center gap-2">
                    <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: facet.accent }}
                    />
                    <h3 className="font-semibold">{facet.title}</h3>
                </div>
                <p className="text-foreground/70 mt-2 text-sm leading-relaxed">
                    {facet.text}
                </p>
            </div>

            <SpotlightBorder
                className={styles.spotlightBorder}
            />
        </div>
    );
}
