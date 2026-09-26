import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useServiceWorker } from '@/components/pwa/ServiceWorkerManager/hooks/useServiceWorker';

type Listener = () => unknown;

const serwistInstances: FakeSerwist[] = [];

class FakeSerwist {
    listeners = new Map<string, Set<Listener>>();
    register = vi.fn(async () => undefined);
    update = vi.fn(async () => undefined);
    messageSkipWaiting = vi.fn();

    constructor(
        public scriptURL: string,
        public options: Record<string, unknown>
    ) {
        serwistInstances.push(this);
    }

    addEventListener(type: string, listener: Listener) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)?.add(listener);
    }

    removeEventListener(type: string, listener: Listener) {
        this.listeners.get(type)?.delete(listener);
    }

    async emit(type: string) {
        for (const listener of this.listeners.get(type) ?? []) {
            await listener();
        }
    }
}

vi.mock('@serwist/window', () => ({
    Serwist: vi.fn(function createSerwist(
        scriptURL: string,
        options: Record<string, unknown>
    ) {
        return new FakeSerwist(scriptURL, options);
    }),
}));

const bundleBuiltAt = '2026-05-01T12:00:00.000Z';

function versionResponse(builtAt: string | undefined, ok = true) {
    return {
        ok,
        json: async () => (builtAt === undefined ? {} : { builtAt }),
    };
}

describe('useServiceWorker', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        serwistInstances.length = 0;
        vi.useFakeTimers();
        vi.stubEnv('NEXT_PUBLIC_BUILD_TIME', bundleBuiltAt);
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(versionResponse(bundleBuiltAt));
        vi.stubGlobal('fetch', fetchMock);
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: {},
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        Reflect.deleteProperty(navigator, 'serviceWorker');
    });

    async function renderServiceWorker() {
        const rendered = renderHook(() => useServiceWorker());
        // Let the on-load version check settle.
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        return rendered;
    }

    function currentSerwist() {
        const [serwist] = serwistInstances;
        return serwist;
    }

    it('does nothing without service worker support', async () => {
        Reflect.deleteProperty(navigator, 'serviceWorker');

        const { result } = await renderServiceWorker();

        expect(serwistInstances).toHaveLength(0);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(result.current.updateReady).toBe(false);
    });

    it('registers /sw.js at the root, bypassing the HTTP cache', async () => {
        await renderServiceWorker();

        const serwist = currentSerwist();
        expect(serwist.scriptURL).toBe('/sw.js');
        expect(serwist.options).toEqual({ scope: '/', updateViaCache: 'none' });
        expect(serwist.register).toHaveBeenCalledTimes(1);
    });

    it('reports an update once a new worker is waiting', async () => {
        const { result } = await renderServiceWorker();
        expect(result.current.updateReady).toBe(false);

        await act(async () => {
            await currentSerwist().emit('waiting');
        });

        expect(result.current.updateReady).toBe(true);
    });

    it('tells the waiting worker to take over on applyUpdate', async () => {
        const { result } = await renderServiceWorker();

        act(() => result.current.applyUpdate());

        expect(currentSerwist().messageSkipWaiting).toHaveBeenCalledTimes(1);
    });

    it('checks a cache-busted version.json on load', async () => {
        await renderServiceWorker();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toMatch(/^\/version\.json\?ts=\d+$/);
        expect(init).toEqual({ cache: 'no-store' });
    });

    it('forces a worker update when the deployed build is newer', async () => {
        fetchMock.mockResolvedValue(
            versionResponse('2026-06-01T00:00:00.000Z')
        );

        await renderServiceWorker();

        expect(currentSerwist().update).toHaveBeenCalledTimes(1);
    });

    it('leaves the worker alone when the deployed build is the same', async () => {
        await renderServiceWorker();

        expect(currentSerwist().update).not.toHaveBeenCalled();
    });

    it('leaves the worker alone when the deployed build is older', async () => {
        fetchMock.mockResolvedValue(
            versionResponse('2026-01-01T00:00:00.000Z')
        );

        await renderServiceWorker();

        expect(currentSerwist().update).not.toHaveBeenCalled();
    });

    it('ignores a missing builtAt, a failed response, and a network error', async () => {
        fetchMock
            .mockResolvedValueOnce(versionResponse(undefined))
            .mockResolvedValueOnce(
                versionResponse('2027-01-01T00:00:00.000Z', false)
            )
            .mockRejectedValueOnce(new TypeError('offline'));

        await renderServiceWorker();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(60_000);
            await vi.advanceTimersByTimeAsync(60_000);
        });

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(currentSerwist().update).not.toHaveBeenCalled();
    });

    it('polls version.json every minute', async () => {
        await renderServiceWorker();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(59_999);
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1);
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('re-checks when connectivity returns', async () => {
        await renderServiceWorker();

        await act(async () => {
            window.dispatchEvent(new Event('online'));
            await vi.advanceTimersByTimeAsync(0);
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('re-checks when the tab becomes visible again', async () => {
        await renderServiceWorker();
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

        await act(async () => {
            document.dispatchEvent(new Event('visibilitychange'));
            await vi.advanceTimersByTimeAsync(0);
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not re-check when the tab is hidden', async () => {
        await renderServiceWorker();
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');

        await act(async () => {
            document.dispatchEvent(new Event('visibilitychange'));
            await vi.advanceTimersByTimeAsync(0);
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('clears runtime caches but keeps the precache when the update takes control', async () => {
        const deleteCache = vi.fn<(cacheName: string) => Promise<boolean>>(
            async () => true
        );
        vi.stubGlobal('caches', {
            keys: vi.fn(async () => [
                'serwist-precache-v2-https://shibbir.me/',
                'pages',
                'static-assets',
            ]),
            delete: deleteCache,
        });
        // jsdom cannot reload; silence its "not implemented" report.
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = await renderServiceWorker();

        act(() => result.current.applyUpdate());
        await act(async () => {
            await currentSerwist().emit('controlling');
        });

        expect(deleteCache.mock.calls.map(([name]) => name)).toEqual([
            'pages',
            'static-assets',
        ]);
    });

    it('handles the takeover only once', async () => {
        const listCaches = vi.fn(async () => ['pages']);
        vi.stubGlobal('caches', {
            keys: listCaches,
            delete: vi.fn(async () => true),
        });
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = await renderServiceWorker();

        act(() => result.current.applyUpdate());
        await act(async () => {
            await currentSerwist().emit('controlling');
            await currentSerwist().emit('controlling');
        });

        expect(listCaches).toHaveBeenCalledTimes(1);
    });

    it('does not reload or clear caches when a first visit gets its worker', async () => {
        // A brand-new visitor's worker claims the page (clientsClaim) without
        // any update being requested; that must not interrupt them.
        const listCaches = vi.fn(async () => ['pages']);
        vi.stubGlobal('caches', {
            keys: listCaches,
            delete: vi.fn(async () => true),
        });
        await renderServiceWorker();

        await act(async () => {
            await currentSerwist().emit('controlling');
        });

        expect(listCaches).not.toHaveBeenCalled();
    });

    it('stops polling and listening after unmount', async () => {
        const { unmount } = await renderServiceWorker();
        const serwist = currentSerwist();

        unmount();
        await act(async () => {
            window.dispatchEvent(new Event('online'));
            await vi.advanceTimersByTimeAsync(120_000);
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(serwist.listeners.get('waiting')?.size).toBe(0);
        expect(serwist.listeners.get('controlling')?.size).toBe(0);
    });
});
