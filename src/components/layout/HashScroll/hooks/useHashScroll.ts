'use client';

import { useEffect } from 'react';

/**
 * Reliably scrolls to the URL fragment on initial load. `scroll-behavior: smooth`
 * on <html> makes the browser's native fragment scroll unreliable: it can start
 * before layout settles and get interrupted, leaving the visitor short of the
 * target. So we re-run the scroll ourselves after paint and again after the load
 * event (once images have sized), with smooth scrolling momentarily disabled so
 * the jump is instant and cannot be interrupted.
 */
export function useHashScroll() {
    useEffect(() => {
        const { hash } = window.location;
        if (hash.length < 2) return;

        const id = decodeURIComponent(hash.slice(1));

        const scrollToTarget = () => {
            const target = document.getElementById(id);
            if (!target) return;
            const root = document.documentElement;
            const previousBehavior = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            target.scrollIntoView();
            root.style.scrollBehavior = previousBehavior;
        };

        const frame = requestAnimationFrame(scrollToTarget);
        window.addEventListener('load', scrollToTarget, { once: true });

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('load', scrollToTarget);
        };
    }, []);
}
