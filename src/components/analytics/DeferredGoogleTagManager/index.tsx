'use client';

import { useEffect, useState } from 'react';
import { GoogleTagManager } from '@next/third-parties/google';
import { googleTagManagerId } from '@/config/constants';

/**
 * Mounts GTM only after the window `load` event plus an idle callback, keeping
 * its ~274KB `gtm.js` download out of the LCP bandwidth window on throttled
 * mobile (the home hero name is the LCP element). `@next/third-parties`'
 * `GoogleTagManager` loads its script `afterInteractive` with no way to override
 * the strategy, so gating the render is how we defer it.
 *
 * No pageviews are lost: `sendGTMEvent` pushes into `window.dataLayer[]` (created
 * lazily), so events fired before GTM boots buffer in the array and are processed
 * once it initializes. Prod-gated by the caller, same as the rest of GTM.
 */
export default function DeferredGoogleTagManager() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const scheduleMount = () => {
            const idle =
                window.requestIdleCallback ??
                ((callback: IdleRequestCallback) =>
                    window.setTimeout(() => callback({} as IdleDeadline), 1));
            idle(() => setMounted(true));
        };

        if (document.readyState === 'complete') {
            scheduleMount();
            return;
        }

        window.addEventListener('load', scheduleMount, { once: true });
        return () => window.removeEventListener('load', scheduleMount);
    }, []);

    if (!mounted) return null;

    return <GoogleTagManager gtmId={googleTagManagerId} />;
}
