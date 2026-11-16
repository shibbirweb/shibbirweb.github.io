import { useEffect, useState } from 'react';

export type ScrollDirection = 'down' | 'up';

// Ignore tiny movements (trackpad jitter, layout nudges) so the direction only
// flips on a deliberate scroll.
const MIN_DELTA_PX = 4;

/**
 * Which way the reader last scrolled the page. Starts as `down` (reading
 * order) and updates once per animation frame while scrolling.
 */
export function useScrollDirection(): ScrollDirection {
    const [direction, setDirection] = useState<ScrollDirection>('down');

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let frame = 0;

        const update = () => {
            frame = 0;
            const delta = window.scrollY - lastScrollY;
            if (Math.abs(delta) < MIN_DELTA_PX) {
                return;
            }
            lastScrollY = window.scrollY;
            setDirection(delta > 0 ? 'down' : 'up');
        };

        const onScroll = () => {
            if (!frame) {
                frame = requestAnimationFrame(update);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frame) {
                cancelAnimationFrame(frame);
            }
        };
    }, []);

    return direction;
}
