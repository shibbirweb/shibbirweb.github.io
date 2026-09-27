'use client';

import { useEffect, useState } from 'react';

/**
 * Latches true once `delayMs` has passed since the window `load` event (or since
 * mount, when the page had already loaded). Starts `false` so the server and
 * first client render agree. Used to hold decorative work back until the page
 * has settled, so it stays out of what page speed tools measure at start-up.
 */
export function useLoadDelayElapsed(delayMs: number): boolean {
    const [hasElapsed, setHasElapsed] = useState(false);

    useEffect(() => {
        let timeoutId: number | undefined;

        const startDelay = () => {
            timeoutId = window.setTimeout(() => setHasElapsed(true), delayMs);
        };

        if (document.readyState === 'complete') {
            startDelay();
        } else {
            window.addEventListener('load', startDelay, { once: true });
        }

        return () => {
            window.removeEventListener('load', startDelay);
            window.clearTimeout(timeoutId);
        };
    }, [delayMs]);

    return hasElapsed;
}
