'use client';

import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Whether the visitor has asked for reduced motion. Starts `false` so the server
 * and first client render agree, then updates after mount and on every change to
 * the media query. Use it to decide behaviour that CSS cannot express on its own
 * (skipping an animation loop, defaulting to a manual control); anything purely
 * visual should still be handled with Tailwind's `motion-safe:` variant.
 */
export function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const query = window.matchMedia(REDUCED_MOTION_QUERY);
        setPrefersReducedMotion(query.matches);

        const onChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    return prefersReducedMotion;
}
