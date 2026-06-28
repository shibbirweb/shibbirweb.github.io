import { useEffect, useState } from 'react';

/**
 * Current vertical scroll position of the window, throttled to one update per
 * animation frame. Drives the mobile wordmark, which rides the scroll straight
 * up off the top of the page like an ordinary element while the menu is closed.
 */
export function useScrollY(): number {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        let frame = 0;
        const onScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                setScrollY(window.scrollY);
            });
        };
        setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return scrollY;
}
