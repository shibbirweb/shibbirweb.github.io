'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Serwist } from '@serwist/window';
import { getBuildVersion } from '@/lib/version';

/** How often a long-lived tab re-checks version.json for a newer deploy. */
const VERSION_POLL_INTERVAL_MS = 60_000;

/** Delete every Cache Storage bucket so the next load pulls fresh assets. */
async function clearAllCaches(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    } catch {
        // Best effort; the reload below still proceeds.
    }
}

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
 * the resulting `controlling` event clears all caches and reloads the page onto
 * the new build.
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

        // When the waiting worker takes control after skipWaiting, drop every
        // Cache Storage bucket (precache + runtime JS/CSS/font/image/page caches)
        // and reload once. Clearing after the new worker controls guarantees the
        // reload re-fetches the newest CSS/JS from the network rather than serving
        // a stale CacheFirst/precache copy.
        let hasReloaded = false;
        const onControlling = async () => {
            if (hasReloaded) return;
            hasReloaded = true;
            await clearAllCaches();
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

        // Check once on load (visiting the site / opening the PWA) so a fresh
        // deploy surfaces immediately instead of only after the first poll tick.
        // Fire-and-forget, so it never blocks first paint.
        void checkForNewVersion();

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

        // Re-check the moment connectivity returns: a tab left open through an
        // offline stretch catches up on any deploy it missed.
        const onOnline = () => void checkForNewVersion();
        window.addEventListener('online', onOnline);

        return () => {
            window.clearInterval(pollTimer);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange
            );
            window.removeEventListener('online', onOnline);
            serwist.removeEventListener('waiting', onWaiting);
            serwist.removeEventListener('controlling', onControlling);
        };
    }, []);

    const applyUpdate = useCallback(() => {
        serwistRef.current?.messageSkipWaiting();
    }, []);

    return { updateReady, applyUpdate };
}
