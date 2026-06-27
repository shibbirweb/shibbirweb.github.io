import { useEffect, useState } from 'react';

/**
 * Whether the window is scrolled to (near) the very top. Drives the mobile
 * wordmark beside the menu button: it shows while the reader is at the top of an
 * inner page, then tucks into the button on the first scroll. The small
 * threshold keeps it shown through sub-pixel jitter and rubber-band overscroll.
 */
export function useScrolledToTop(threshold = 8): boolean {
    const [atTop, setAtTop] = useState(true);

    useEffect(() => {
        const update = () => setAtTop(window.scrollY <= threshold);
        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, [threshold]);

    return atTop;
}
