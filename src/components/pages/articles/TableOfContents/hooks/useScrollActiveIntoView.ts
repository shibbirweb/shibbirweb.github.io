import { useEffect, type RefObject } from 'react';

/**
 * Keeps the active table-of-contents item visible inside its own scroll
 * container. When the highlighted heading changes, scrolls the container so the
 * marked item (`[aria-current="location"]`) is in view, but scrolls **only the
 * container**: `element.scrollIntoView()` would walk every scroll ancestor
 * including the window and jump the article, so this adjusts `scrollTop`
 * directly. Does nothing while the item is already visible, to avoid jitter.
 */
export function useScrollActiveIntoView(
    containerRef: RefObject<HTMLElement | null>,
    activeId: string | null
): void {
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !activeId) return;

        const item = container.querySelector<HTMLElement>(
            '[aria-current="location"]'
        );
        if (!item) return;

        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const padding = 16;

        // When the first item is active, scroll fully to the top so the
        // "On this page" heading above the list stays visible instead of being
        // clipped by the padding offset.
        const isFirst = item === container.querySelector('a');

        let top: number | null = null;
        if (isFirst) {
            if (container.scrollTop > 0) top = 0;
        } else if (itemRect.top < containerRect.top + padding) {
            top = container.scrollTop + (itemRect.top - containerRect.top - padding);
        } else if (itemRect.bottom > containerRect.bottom - padding) {
            top = container.scrollTop + (itemRect.bottom - containerRect.bottom + padding);
        }
        if (top === null) return;

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        container.scrollTo({
            top,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    }, [containerRef, activeId]);
}
