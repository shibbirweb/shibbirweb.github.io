'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Serwist } from '@serwist/window';
import { getBuildVersion } from '@/lib/version';

/** How often a long-lived tab re-checks version.json for a newer deploy. */
const VERSION_POLL_INTERVAL_MS = 60_000;

interface ServiceWorkerState {
    /** True once an updated service worker is waiting to take over. */
    updateReady: boolean;
    /** Tell the waiting worker to activate; the page reloads when it takes control. */
    applyUpdate: () => void;
}

/**
 * Registers the service worker and surfaces when a new build is ready.
 *
 * Two triggers feed `updateReady`: the service worker's own `waiting` lifecycle
 * (a new worker installed alongside the running one), and a poll of the static
 * `version.json` whose `version` is compared against the version baked into this
 * bundle. When the deployed version is greater, `serwist.update()` forces the
 * browser to re-check the worker so `waiting` fires without waiting for its
 * periodic byte-check. Applying the update messages the worker to skip waiting;
 * the resulting `controlling` event reloads the page onto the new build.
 */
export function useServiceWorker(): ServiceWorkerState {
    const [updateReady, setUpdateReady] = useState(false);
    const serwistRef = useRef<Serwist | null>(null);

    useEffect(() => {
        if (
            typeof window === 'undefined' ||
            !('serviceWorker' in navigator)
        ) {
            return;
        }

        const serwist = new Serwist('/sw.js', { scope: '/' });
        serwistRef.current = serwist;

        const onWaiting = () => setUpdateReady(true);
        serwist.addEventListener('waiting', onWaiting);

        // When the waiting worker takes control after skipWaiting, reload once so
        // the page renders the new build.
        let hasReloaded = false;
        const onControlling = () => {
            if (hasReloaded) return;
            hasReloaded = true;
            window.location.reload();
        };
        serwist.addEventListener('controlling', onControlling);

        void serwist.register();

        const currentVersion = getBuildVersion();
        const checkForNewVersion = async () => {
            try {
                const response = await fetch('/version.json', {
                    cache: 'no-store',
                });
                if (!response.ok) return;
                const data: { version?: number } = await response.json();
                if (
                    typeof data.version === 'number' &&
                    data.version > currentVersion
                ) {
                    await serwist.update();
                }
            } catch {
                // Offline or transient failure; retry on the next tick.
            }
        };

        const pollTimer = window.setInterval(
            checkForNewVersion,
            VERSION_POLL_INTERVAL_MS
        );
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void checkForNewVersion();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.clearInterval(pollTimer);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange
            );
            serwist.removeEventListener('waiting', onWaiting);
            serwist.removeEventListener('controlling', onControlling);
        };
    }, []);

    const applyUpdate = useCallback(() => {
        serwistRef.current?.messageSkipWaiting();
    }, []);

    return { updateReady, applyUpdate };
}
