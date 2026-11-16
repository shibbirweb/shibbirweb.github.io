import type { CSSProperties } from 'react';
import ArticleCover from '@/components/pages/articles/ArticleCover';
import styles from '@/components/pages/articles/SeriesIndex/SeriesCoverStack/SeriesCoverStack.module.css';
import { cn } from '@/utils/cn';
import type { SeriesShelfPart } from '@/utils/seriesShelf';

/** The most covers a stack shows; later parts are still listed below it. */
export const STACKED_COVER_LIMIT = 3;

/**
 * The parts' covers stacked like a deck of cards, part 1 in front, so a series
 * reads as a set at a glance. The surface around it sets `--fan` on hover to
 * spread the deck (SeriesCoverStack.module.css). Decorative: the parts are
 * listed in text beside it.
 */
export default function SeriesCoverStack({
    parts,
    className,
    eager = false,
}: {
    parts: SeriesShelfPart[];
    className?: string;
    eager?: boolean;
}) {
    const stacked = parts.slice(0, STACKED_COVER_LIMIT);

    return (
        <div
            aria-hidden
            className={cn(styles.stack, className)}
            style={{ '--layers': stacked.length - 1 } as CSSProperties}
        >
            {stacked.map((part, depth) => (
                <ArticleCover
                    key={part.slug}
                    src={part.cover}
                    eager={eager && depth === 0}
                    className={styles.cover}
                    style={{ '--depth': depth } as CSSProperties}
                />
            ))}
        </div>
    );
}
