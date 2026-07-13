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

// Serwist's stock defaultCache ends with two greedy rules: a NetworkFirst that
// caches every cross-origin response and a NetworkOnly wildcard. When a
// third-party script GTM injects (e.g. the Facebook pixel) is blocked or
// offline, that NetworkFirst finds no cached fallback and rejects the fetch
// event with `no-response`, surfacing as an uncaught SW error. Drop both
// catch-alls (they are the last two entries) so third-party requests fall
// through to the browser; caching them is pointless for a static site, and
// same-origin pages/assets plus Google Fonts keep their specific rules above.
const runtimeCaching = defaultCache.slice(0, -2);

// The offline shell (/offline-fallback.html) is already in the Serwist precache
// manifest (public/offline-fallback.html is a public asset), so it is available
// to serve as the navigation fallback below. It is a plain static file rather
// than a Next route on purpose: a Next document served under an arbitrary URL
// would re-run the client router and render not-found instead of the offline
// message. At build time scripts/generate-offline-fallback.ts overwrites it with
// a self-contained, script-stripped snapshot of the /offline route, so the
// fallback shows the real site chrome (navbar, footer, theme) with no hydration
// and no router. public/offline-fallback.html is the committed placeholder that
// keeps the precache entry present (and is what dev serves).
const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    // The update toast drives the swap, so a new worker waits until the client
    // messages SKIP_WAITING (@serwist/window's messageSkipWaiting) rather than
    // activating over an open tab.
    skipWaiting: false,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching,
    // When an unvisited page is opened offline, serve the precached
    // /offline-fallback.html shell instead of the browser's default error page.
    fallbacks: {
        entries: [
            {
                url: '/offline-fallback.html',
                matcher({ request }) {
                    return request.destination === 'document';
                },
            },
        ],
    },
});

serwist.addEventListeners();
