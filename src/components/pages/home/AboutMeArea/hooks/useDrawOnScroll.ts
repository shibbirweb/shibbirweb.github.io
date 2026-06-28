'use client';

import { useEffect, useRef, useState } from 'react';

export type DrawState = 'static' | 'collapsed' | 'drawn';

/**
 * Drives a draw-in-on-scroll effect (e.g. SVG connector lines). Mirrors the
 * AnimatedUnderline approach: render fully drawn for no-JS / reduced motion,
 * otherwise collapse off-screen then draw once the element scrolls into view.
 */
export function useDrawOnScroll<T extends Element>(threshold = 0.4) {
    const ref = useRef<T>(null);
    const [state, setState] = useState<DrawState>('static');

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // keep the static, fully-drawn lines
        }
        const element = ref.current;
        if (!element || !('IntersectionObserver' in window)) {
            setState('drawn');
            return;
        }
        // collapse first (happens off-screen, so there is no visible flash)
        setState('collapsed');
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setState('drawn');
                        observer.disconnect();
                        break;
                    }
                }
            },
            { threshold }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, state };
}
