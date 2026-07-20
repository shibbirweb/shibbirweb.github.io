import type { CSSProperties } from 'react';
import { Facet } from '@/components/pages/home/AboutMeArea/contents';
import styles from '@/components/pages/home/AboutMeArea/FacetCard.module.css';
import { cn } from '@/utils/cn';

// One facet card: an accent-dotted title and a one-line statement. On hover a
// soft accent gradient grows in from the corner the connector line attaches to,
// matching the line's colour and direction. `persistent` keeps a faint tint for
// the bento tiles, which can't be hovered on touch.
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
            className={cn(
                styles.card,
                persistent && styles.persistent,
                'border-foreground/10 bg-background z-10 rounded-2xl border p-5 shadow-sm',
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
        </div>
    );
}
