'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks how far the reader has scrolled through the first `<article>` on the
 * page, as a 0..1 fraction. Progress is measured against the article's own
 * height (not the whole document), so the bar fills exactly as the body is read
 * and ignores the header, footer, and related-posts tail. Recomputed on scroll
 * and resize, throttled to one update per animation frame.
 */
export function useReadingProgress(): number {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const article = document.querySelector('article');
        if (!article) return;

        let frame = 0;
        const measure = () => {
            frame = 0;
            const rect = article.getBoundingClientRect();
            const scrollable = rect.height - window.innerHeight;
            if (scrollable <= 0) {
                setProgress(rect.top <= 0 ? 1 : 0);
                return;
            }
            const scrolled = -rect.top;
            setProgress(Math.min(1, Math.max(0, scrolled / scrollable)));
        };
        const onScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return progress;
}
