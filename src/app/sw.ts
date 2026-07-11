/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// Serwist injects the precache manifest (the app shell) at build time; runtime
// caching (defaultCache) then handles visited pages/assets so they work offline.
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

// The static offline shell (public/offline.html) is already in the Serwist
// precache manifest (it is a public asset), so it is available to serve as the
// navigation fallback below. It is a plain static file rather than a Next route
// on purpose: a Next document served under an arbitrary URL would re-run the
// client router and render not-found instead of the offline message.
const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    // The update toast drives the swap, so a new worker waits until the client
    // messages SKIP_WAITING (@serwist/window's messageSkipWaiting) rather than
    // activating over an open tab.
    skipWaiting: false,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
    // When an unvisited page is opened offline, serve the precached
    // /offline.html shell instead of the browser's default error page.
    fallbacks: {
        entries: [
            {
                url: '/offline.html',
                matcher({ request }) {
                    return request.destination === 'document';
                },
            },
        ],
    },
});

serwist.addEventListeners();
