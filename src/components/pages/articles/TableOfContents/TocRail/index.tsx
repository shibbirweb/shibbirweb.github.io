import { useRef } from 'react';
import TocRailItem from '@/components/pages/articles/TableOfContents/TocRail/TocRailItem';
import TocRailLine from '@/components/pages/articles/TableOfContents/TocRail/TocRailLine';
import { useRailGeometry } from '@/components/pages/articles/TableOfContents/TocRail/hooks/useRailGeometry';
import type { ScrollDirection } from '@/components/pages/articles/TableOfContents/hooks/useScrollDirection';
import type { TocItem } from '@/lib/posts';

/**
 * The desktop table of contents list with a scroll rail: the links, plus a line
 * down their left edge whose highlighted stretch follows the sections on
 * screen as the reader scrolls.
 */
export default function TocRail({
    toc,
    currentId,
    visibleIds,
    direction,
}: {
    toc: TocItem[];
    currentId: string | null;
    visibleIds: string[];
    direction: ScrollDirection;
}) {
    const listRef = useRef<HTMLUListElement>(null);
    const items = useRailGeometry(
        listRef,
        toc.map((item) => item.id).join('|')
    );
    const visibleIndexes = toc.flatMap((item, index) => {
        if (visibleIds.includes(item.id)) {
            return [index];
        }
        return [];
    });

    return (
        <div className="relative">
            <TocRailLine
                items={items}
                visibleIndexes={visibleIndexes}
                direction={direction}
            />
            <ul
                ref={listRef}
                className="relative text-sm"
            >
                {toc.map((item) => (
                    <TocRailItem
                        key={item.id}
                        item={item}
                        isCurrent={item.id === currentId}
                        isVisible={visibleIds.includes(item.id)}
                    />
                ))}
            </ul>
        </div>
    );
}
