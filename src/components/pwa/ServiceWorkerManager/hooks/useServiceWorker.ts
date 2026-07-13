'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Serwist } from '@serwist/window';
import { getBuiltAt } from '@/lib/version';

/** How often a long-lived tab re-checks version.json for a newer deploy. */
const VERSION_POLL_INTERVAL_MS = 60_000;

/** Cache Storage buckets whose name contains this are the Serwist precache. */
const PRECACHE_NAME_MARKER = 'serwist-precache';

/**
 * Delete the runtime caches (visited pages, static assets, images) while
 * preserving the Serwist precache. Called when an update takes over so a
 * stable-URL asset that changed in place (e.g. an image reused under the same
 * filename) is refetched fresh, without dropping the precache: the app shell,
 * the home document (`/`), and /offline-fallback.html live there and must stay
 * available offline. The emptied runtime caches repopulate on demand as
 * pages/assets are fetched again.
 */
async function clearRuntimeCaches(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
        const cacheKeys = await caches.keys();
        await Promise.all(
            cacheKeys
                .filter((key) => !key.includes(PRECACHE_NAME_MARKER))
                .map((key) => caches.delete(key))
        );
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
 * `version.json` whose `builtAt` is compared against the `builtAt` baked into
 * this bundle. When the deployed build is strictly newer, `serwist.update()`
 * forces the browser to re-check the worker so `waiting` fires without waiting
 * for its periodic byte-check. Applying the update messages the worker to skip
 * waiting; the resulting `controlling` event clears the runtime caches (keeping
 * the precache) and reloads the page onto the new build, so offline access
 * survives the update.
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

        // updateViaCache: 'none' makes the browser bypass the HTTP cache when
        // fetching sw.js (and its imports) on every update check. The deploy
        // serves sw.js with a multi-hour max-age, so without this a client could
        // install a stale sw.js whose precache manifest lists a previous build's
        // content-hashed assets (already deleted by a newer deploy) and fail the
        // whole install with bad-precaching-response. Always fetching a fresh
        // sw.js keeps the manifest in step with the live assets.
        const serwist = new Serwist('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        });
        serwistRef.current = serwist;

        const onWaiting = () => setUpdateReady(true);
        serwist.addEventListener('waiting', onWaiting);

        // When the waiting worker takes control after skipWaiting, drop the
        // runtime caches (so a changed stable-URL asset is refetched fresh) but
        // keep the Serwist precache, then reload once. Never clear everything:
        // the precache holds the app shell, the home document, and
        // /offline-fallback.html, and the already installed worker will not
        // re-run its precache install step, so wiping it would break offline
        // access until the next deploy.
        let hasReloaded = false;
        const onControlling = async () => {
            if (hasReloaded) return;
            hasReloaded = true;
            await clearRuntimeCaches();
            window.location.reload();
        };
        serwist.addEventListener('controlling', onControlling);

        void serwist.register();

        const currentBuiltAt = new Date(getBuiltAt()).getTime();
        const checkForNewBuild = async () => {
            try {
                // The per-request query defeats CDN and service-worker caches
                // (version.json ships with a max-age), so every poll reflects the
                // currently deployed build rather than a stale cached copy.
                const response = await fetch(`/version.json?ts=${Date.now()}`, {
                    cache: 'no-store',
                });
                if (!response.ok) return;
                const data: { builtAt?: string } = await response.json();
                const deployedBuiltAt = new Date(data.builtAt ?? '').getTime();
                if (
                    Number.isFinite(deployedBuiltAt) &&
                    deployedBuiltAt > currentBuiltAt
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
        void checkForNewBuild();

        const pollTimer = window.setInterval(
            checkForNewBuild,
            VERSION_POLL_INTERVAL_MS
        );
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void checkForNewBuild();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Re-check the moment connectivity returns: a tab left open through an
        // offline stretch catches up on any deploy it missed.
        const onOnline = () => void checkForNewBuild();
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
