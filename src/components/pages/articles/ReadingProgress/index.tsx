'use client';

import { useReadingProgress } from '@/components/pages/articles/ReadingProgress/hooks/useReadingProgress';
import { accentStyle } from '@/utils/accentStyle';

/**
 * A thin progress bar pinned to the top of the viewport that fills as the reader
 * scrolls through the article body. It is tinted with the article's own cover
 * accent so the page keeps a single colour identity. Decorative for sighted
 * users but exposed as a progressbar for assistive tech.
 */
export default function ReadingProgress({
    accentColors,
}: {
    accentColors: readonly [string, string];
}) {
    const progress = useReadingProgress();
    const percent = Math.round(progress * 100);

    return (
        <div
            role="progressbar"
            aria-label="Reading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            style={accentStyle(accentColors)}
            className="fixed inset-x-0 top-0 z-50 h-[3px] print:hidden"
        >
            <div
                style={{ transform: `scaleX(${progress})` }}
                className="h-full origin-left bg-linear-to-r from-[var(--accent-from)] to-[var(--accent-to)]"
            />
        </div>
    );
}
