import { useEffect, useState, type RefObject } from 'react';
import type { RailItem } from '@/components/pages/articles/TableOfContents/TocRail/railPath';

/**
 * Measures each table-of-contents link inside the list (its top, bottom and
 * nesting depth from `data-toc-depth`) so the rail can be drawn beside them.
 * Re-measures when the list resizes (late web fonts, wrapping headings) and
 * when the entries change.
 */
export function useRailGeometry(
    listRef: RefObject<HTMLUListElement | null>,
    entryKey: string
): RailItem[] {
    const [items, setItems] = useState<RailItem[]>([]);

    useEffect(() => {
        const list = listRef.current;
        if (!list) {
            return;
        }

        const measure = () => {
            const links =
                list.querySelectorAll<HTMLElement>('a[data-toc-depth]');
            setItems(
                Array.from(links, (link) => ({
                    top: link.offsetTop,
                    bottom: link.offsetTop + link.offsetHeight,
                    depth: Number(link.dataset.tocDepth),
                }))
            );
        };

        measure();
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        return () => observer.disconnect();
    }, [listRef, entryKey]);

    return items;
}
