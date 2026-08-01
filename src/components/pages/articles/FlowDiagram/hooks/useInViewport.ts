'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether the referenced element is at or near the viewport, reported continuously.
 * `useDrawOnScroll` fires once and disconnects because a draw-in only happens once;
 * this keeps watching, so a caller can stop doing work while the element is out of
 * sight and pick it up again when it returns.
 *
 * `rootMargin` defaults to a generous band so the element counts as visible shortly
 * before it scrolls in, and whatever the caller drives is already running by the
 * time the reader reaches it.
 *
 * Reports `true` when IntersectionObserver is unavailable. The point of the hook is
 * to skip work nobody can see, and doing that work needlessly is a far better
 * failure than leaving the caller switched off forever.
 */
export function useInViewport<T extends Element>(
    ref: RefObject<T | null>,
    rootMargin = '200px 0px'
): boolean {
    const [isInViewport, setIsInViewport] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        if (!('IntersectionObserver' in window)) {
            setIsInViewport(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => setIsInViewport(entry.isIntersecting),
            { rootMargin }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, rootMargin]);

    return isInViewport;
}
