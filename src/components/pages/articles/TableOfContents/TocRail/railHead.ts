import type { ScrollDirection } from '@/components/pages/articles/TableOfContents/hooks/useScrollDirection';
import type { RailRange } from '@/components/pages/articles/TableOfContents/TocRail/railPath';

/** Where the head dot sits: the end of the highlight that leads the scroll. */
export function railHeadPosition(
    range: RailRange,
    direction: ScrollDirection
): { x: number; y: number } {
    if (direction === 'up') {
        return { x: range.topX, y: range.top };
    }
    return { x: range.bottomX, y: range.bottom };
}
