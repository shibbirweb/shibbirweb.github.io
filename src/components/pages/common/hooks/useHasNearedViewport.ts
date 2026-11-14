'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether the referenced element has come near the viewport at least once.
 * Unlike useInViewport (which keeps reporting, so work can pause off screen),
 * this latches: once true it stays true and stops observing, for work that
 * should start late but never be undone, like drawing a diagram.
 *
 * `rootMargin` starts the work well before the element scrolls in, so a reader
 * scrolling normally never sees it unfinished. Reports `true` at once where
 * IntersectionObserver is unavailable, so the work still happens.
 */
export function useHasNearedViewport<T extends Element>(
    ref: RefObject<T | null>,
    rootMargin = '600px 0px'
): boolean {
    const [hasNeared, setHasNeared] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || hasNeared) {
            return;
        }
        if (!('IntersectionObserver' in window)) {
            setHasNeared(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setHasNeared(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, rootMargin, hasNeared]);

    return hasNeared;
}
