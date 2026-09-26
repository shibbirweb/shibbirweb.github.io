import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    NETWORK_AUTO_RELOAD_KEY,
    OFFLINE_COPY,
    OFFLINE_HEADING,
    OFFLINE_STATUS,
    ONLINE_COPY,
    ONLINE_HEADING,
    ONLINE_STATUS,
    RECONNECT_SCRIPT,
    RELOAD_DELAY_SECONDS,
} from '@/components/pages/network-status/reconnect';

type WindowListener = [string, EventListenerOrEventListenerObject];

let windowListeners: WindowListener[];
let fetchStub: ReturnType<typeof vi.fn>;

function renderMarkup({ withAutoReload }: { withAutoReload: boolean }) {
    document.body.innerHTML = `
        <main data-network-root data-status="offline">
            <h1 data-network-title>${OFFLINE_HEADING}</h1>
            <p data-network-status>${OFFLINE_STATUS}</p>
            <p data-network-copy>${OFFLINE_COPY}</p>
            ${withAutoReload ? '<input type="checkbox" data-network-autoreload />' : ''}
            <span data-network-countdown></span>
        </main>
    `;
    return document.querySelector('[data-network-root]') as HTMLElement;
}

function runScript() {
    new Function(RECONNECT_SCRIPT)();
}

function text(selector: string): string | null {
    return document.querySelector(selector)?.textContent ?? null;
}

function respondWith(isOk: boolean) {
    return Promise.resolve({ ok: isOk });
}

beforeEach(() => {
    vi.useFakeTimers();
    windowListeners = [];
    const addEventListener = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation(
        (
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ) => {
            windowListeners.push([type, listener]);
            addEventListener(type, listener, options);
        }
    );
    fetchStub = vi.fn(() => respondWith(true));
    vi.stubGlobal('fetch', fetchStub);
});

afterEach(() => {
    for (const [type, listener] of windowListeners) {
        window.removeEventListener(type, listener);
    }
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
    document.body.innerHTML = '';
});

describe('RECONNECT_SCRIPT source', () => {
    it('is a self-contained IIFE string with no module syntax', () => {
        expect(typeof RECONNECT_SCRIPT).toBe('string');
        expect(RECONNECT_SCRIPT.startsWith('(function () {')).toBe(true);
        expect(RECONNECT_SCRIPT.trimEnd().endsWith('})();')).toBe(true);
        expect(RECONNECT_SCRIPT).not.toMatch(
            /\bimport\b|\brequire\(|\bexport\b/
        );
    });

    it('inlines the storage key, delay, and copy', () => {
        expect(RECONNECT_SCRIPT).toContain(
            JSON.stringify(NETWORK_AUTO_RELOAD_KEY)
        );
        expect(RECONNECT_SCRIPT).toContain(
            `var DELAY = ${RELOAD_DELAY_SECONDS};`
        );
        expect(RECONNECT_SCRIPT).toContain(JSON.stringify(ONLINE_HEADING));
        expect(RECONNECT_SCRIPT).toContain(JSON.stringify(ONLINE_COPY));
        expect(RECONNECT_SCRIPT).not.toContain('${');
    });

    it('does nothing on a page without the network root', async () => {
        document.body.innerHTML = '<p>Other page</p>';
        expect(runScript).not.toThrow();
        await vi.advanceTimersByTimeAsync(10000);
        expect(fetchStub).not.toHaveBeenCalled();
    });
});

describe('RECONNECT_SCRIPT behaviour', () => {
    it('flips to online after a successful probe', async () => {
        const root = renderMarkup({ withAutoReload: false });
        runScript();
        await vi.advanceTimersByTimeAsync(0);

        expect(fetchStub).toHaveBeenCalledTimes(1);
        const [probeUrl, probeOptions] = fetchStub.mock.calls[0];
        expect(probeUrl).toMatch(/^\/version\.json\?probe=\d+$/);
        expect(probeOptions).toEqual({ cache: 'no-store' });
        expect(root.getAttribute('data-status')).toBe('online');
        expect(text('[data-network-title]')).toBe(ONLINE_HEADING);
        expect(text('[data-network-status]')).toBe(ONLINE_STATUS);
        expect(text('[data-network-copy]')).toBe(ONLINE_COPY);
    });

    it('flips back to offline on the offline event', async () => {
        const root = renderMarkup({ withAutoReload: false });
        runScript();
        await vi.advanceTimersByTimeAsync(0);
        expect(root.getAttribute('data-status')).toBe('online');

        window.dispatchEvent(new Event('offline'));

        expect(root.getAttribute('data-status')).toBe('offline');
        expect(text('[data-network-title]')).toBe(OFFLINE_HEADING);
        expect(text('[data-network-status]')).toBe(OFFLINE_STATUS);
        expect(text('[data-network-copy]')).toBe(OFFLINE_COPY);
    });

    it('stays offline when the probe fails or the server is not ok', async () => {
        fetchStub.mockImplementationOnce(() =>
            Promise.reject(new Error('down'))
        );
        const root = renderMarkup({ withAutoReload: false });
        runScript();
        await vi.advanceTimersByTimeAsync(0);
        expect(root.getAttribute('data-status')).toBe('offline');

        fetchStub.mockImplementationOnce(() => respondWith(false));
        await vi.advanceTimersByTimeAsync(5000);
        expect(root.getAttribute('data-status')).toBe('offline');
    });

    it('keeps polling while offline and stops once online', async () => {
        fetchStub.mockImplementationOnce(() =>
            Promise.reject(new Error('down'))
        );
        const root = renderMarkup({ withAutoReload: false });
        runScript();
        await vi.advanceTimersByTimeAsync(0);
        expect(fetchStub).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(5000);
        expect(fetchStub).toHaveBeenCalledTimes(2);
        expect(root.getAttribute('data-status')).toBe('online');

        await vi.advanceTimersByTimeAsync(15000);
        expect(fetchStub).toHaveBeenCalledTimes(2);
    });

    it('probes again when the online event fires', async () => {
        fetchStub.mockImplementationOnce(() =>
            Promise.reject(new Error('down'))
        );
        const root = renderMarkup({ withAutoReload: false });
        runScript();
        await vi.advanceTimersByTimeAsync(0);
        expect(root.getAttribute('data-status')).toBe('offline');

        window.dispatchEvent(new Event('online'));
        await vi.advanceTimersByTimeAsync(0);

        expect(fetchStub).toHaveBeenCalledTimes(2);
        expect(root.getAttribute('data-status')).toBe('online');
    });

    it('counts down to a reload when serving as the fallback at another URL', async () => {
        window.history.replaceState(null, '', '/articles/some-post');
        renderMarkup({ withAutoReload: true });
        runScript();

        const checkbox = document.querySelector(
            '[data-network-autoreload]'
        ) as HTMLInputElement;
        expect(checkbox.checked).toBe(true);

        await vi.advanceTimersByTimeAsync(0);
        expect(text('[data-network-countdown]')).toBe(
            `Reloading in ${RELOAD_DELAY_SECONDS}s…`
        );

        await vi.advanceTimersByTimeAsync(1000);
        expect(text('[data-network-countdown]')).toBe(
            `Reloading in ${RELOAD_DELAY_SECONDS - 1}s…`
        );

        window.dispatchEvent(new Event('offline'));
        expect(text('[data-network-countdown]')).toBe('');
    });

    it('never counts down on the /network-status route itself', async () => {
        window.history.replaceState(null, '', '/network-status');
        const root = renderMarkup({ withAutoReload: true });
        runScript();
        await vi.advanceTimersByTimeAsync(0);

        expect(root.getAttribute('data-status')).toBe('online');
        expect(text('[data-network-countdown]')).toBe('');
    });

    it('restores a stored opt-out and persists toggling the checkbox', async () => {
        window.history.replaceState(null, '', '/articles/some-post');
        window.localStorage.setItem(NETWORK_AUTO_RELOAD_KEY, '0');
        renderMarkup({ withAutoReload: true });
        runScript();

        const checkbox = document.querySelector(
            '[data-network-autoreload]'
        ) as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        await vi.advanceTimersByTimeAsync(0);
        expect(text('[data-network-countdown]')).toBe('');

        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
        expect(window.localStorage.getItem(NETWORK_AUTO_RELOAD_KEY)).toBe('1');
        expect(text('[data-network-countdown]')).toBe(
            `Reloading in ${RELOAD_DELAY_SECONDS}s…`
        );

        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change'));
        expect(window.localStorage.getItem(NETWORK_AUTO_RELOAD_KEY)).toBe('0');
        expect(text('[data-network-countdown]')).toBe('');
    });
});
