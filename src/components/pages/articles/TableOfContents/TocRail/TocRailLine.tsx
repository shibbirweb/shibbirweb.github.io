import { cn } from '@/utils/cn';
import type { ScrollDirection } from '@/components/pages/articles/TableOfContents/hooks/useScrollDirection';
import { railHeadPosition } from '@/components/pages/articles/TableOfContents/TocRail/railHead';
import {
    buildRailPath,
    railRange,
    railX,
    type RailItem,
} from '@/components/pages/articles/TableOfContents/TocRail/railPath';

const DOT_SIZE_PX = 6;

/**
 * The rail beside the table of contents: a faint line that steps in for nested
 * headings, with the stretch covering the on-screen sections drawn over it in
 * the article's accent and a head dot on the end that leads the scroll (the
 * bottom while scrolling down, the top while scrolling up). The highlighted
 * stretch is the same path clipped to the visible range, so moving the clip
 * animates it along the bends.
 */
export default function TocRailLine({
    items,
    visibleIndexes,
    direction,
}: {
    items: RailItem[];
    visibleIndexes: number[];
    direction: ScrollDirection;
}) {
    const lastItem = items[items.length - 1];
    if (!lastItem) {
        return null;
    }

    const path = buildRailPath(items);
    const height = lastItem.bottom;
    const width = railX(Math.max(...items.map((item) => item.depth))) + 2;
    const range = railRange(items, visibleIndexes);
    const head = range ? railHeadPosition(range, direction) : null;

    return (
        <div
            aria-hidden
            data-testid="toc-rail"
            className="pointer-events-none absolute top-0 left-0 text-[color-mix(in_oklab,var(--accent-to),var(--foreground)_45%)]"
            style={{ width, height }}
        >
            <svg
                width={width}
                height={height}
                fill="none"
                className="text-foreground/15 absolute inset-0 overflow-visible"
            >
                <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth={1}
                />
            </svg>
            <svg
                data-testid="toc-rail-thumb"
                width={width}
                height={height}
                fill="none"
                className={cn(
                    'absolute inset-0 overflow-visible motion-safe:transition-[clip-path,opacity] motion-safe:duration-300 motion-safe:ease-out',
                    range ? 'opacity-100' : 'opacity-0'
                )}
                style={{
                    clipPath: range
                        ? `inset(${range.top}px -4px ${height - range.bottom}px -4px)`
                        : undefined,
                }}
            >
                <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                />
            </svg>
            <span
                data-testid="toc-rail-head"
                className={cn(
                    'absolute top-0 left-0 rounded-full bg-current motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out',
                    head ? 'opacity-100' : 'opacity-0'
                )}
                style={{
                    width: DOT_SIZE_PX,
                    height: DOT_SIZE_PX,
                    transform: head
                        ? `translate(${head.x - DOT_SIZE_PX / 2}px, ${head.y - DOT_SIZE_PX / 2}px)`
                        : undefined,
                }}
            />
        </div>
    );
}
