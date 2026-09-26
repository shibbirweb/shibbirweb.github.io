import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { themeOptions } from '@/components/layout/ThemeToggle/options';
import {
    THEME_STORAGE_KEY,
    applyPreference,
    getResolvedTheme,
    getStoredPreference,
    notifyPreferenceChange,
    resolvePreference,
    storePreference,
    subscribe,
} from '@/components/layout/ThemeToggle/theme';

type MediaChangeListener = () => void;

const originalMatchMedia = window.matchMedia;
let mediaChangeListeners: Set<MediaChangeListener>;

function stubSystemScheme(prefersDark: boolean) {
    window.matchMedia = vi.fn((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' && prefersDark,
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: MediaChangeListener) => {
            mediaChangeListeners.add(listener);
        },
        removeEventListener: (_type: string, listener: MediaChangeListener) => {
            mediaChangeListeners.delete(listener);
        },
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
}

function flipSystemScheme() {
    for (const listener of mediaChangeListeners) {
        listener();
    }
}

beforeEach(() => {
    mediaChangeListeners = new Set();
    stubSystemScheme(false);
});

afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
});

describe('stored preference', () => {
    it('defaults to system when nothing is stored', () => {
        expect(getStoredPreference()).toBe('system');
    });

    it('reads back a stored light or dark preference', () => {
        storePreference('dark');
        expect(getStoredPreference()).toBe('dark');
        storePreference('light');
        expect(getStoredPreference()).toBe('light');
    });

    it('stores under the theme key', () => {
        storePreference('dark');
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        expect(THEME_STORAGE_KEY).toBe('theme');
    });

    it('falls back to system for an invalid stored value', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
        expect(getStoredPreference()).toBe('system');
    });

    it('falls back to system when storage cannot be read', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        expect(getStoredPreference()).toBe('system');
    });

    it('ignores storage write failures', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });
        expect(() => storePreference('dark')).not.toThrow();
    });
});

describe('resolvePreference', () => {
    it('keeps an explicit light or dark choice regardless of the OS', () => {
        stubSystemScheme(true);
        expect(resolvePreference('light')).toBe('light');
        stubSystemScheme(false);
        expect(resolvePreference('dark')).toBe('dark');
    });

    it('resolves system to dark when the OS prefers dark', () => {
        stubSystemScheme(true);
        expect(resolvePreference('system')).toBe('dark');
    });

    it('resolves system to light when the OS prefers light', () => {
        stubSystemScheme(false);
        expect(resolvePreference('system')).toBe('light');
    });
});

describe('applyPreference', () => {
    it('writes the resolved theme to data-theme and color-scheme', () => {
        applyPreference('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('never writes system to the element', () => {
        stubSystemScheme(true);
        applyPreference('system');
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(document.documentElement.style.colorScheme).toBe('dark');

        stubSystemScheme(false);
        applyPreference('system');
        expect(document.documentElement.dataset.theme).toBe('light');
        expect(document.documentElement.style.colorScheme).toBe('light');
    });
});

describe('getResolvedTheme', () => {
    it('reads the theme already applied to the element', () => {
        stubSystemScheme(true);
        document.documentElement.dataset.theme = 'light';
        expect(getResolvedTheme()).toBe('light');
    });

    it('falls back to the OS scheme when nothing valid is applied', () => {
        document.documentElement.dataset.theme = 'system';
        stubSystemScheme(true);
        expect(getResolvedTheme()).toBe('dark');
        document.documentElement.removeAttribute('data-theme');
        stubSystemScheme(false);
        expect(getResolvedTheme()).toBe('light');
    });
});

describe('subscribe', () => {
    it('fires on an in-tab preference change', () => {
        const listener = vi.fn();
        const unsubscribe = subscribe(listener);
        notifyPreferenceChange();
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it('fires on a cross-tab storage write to the theme key', () => {
        const listener = vi.fn();
        const unsubscribe = subscribe(listener);
        window.dispatchEvent(
            new StorageEvent('storage', { key: THEME_STORAGE_KEY })
        );
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it('ignores storage writes to other keys', () => {
        const listener = vi.fn();
        const unsubscribe = subscribe(listener);
        window.dispatchEvent(
            new StorageEvent('storage', { key: 'network-auto-reload' })
        );
        window.dispatchEvent(new StorageEvent('storage', { key: null }));
        expect(listener).not.toHaveBeenCalled();
        unsubscribe();
    });

    it('fires when the OS colour scheme flips', () => {
        const listener = vi.fn();
        const unsubscribe = subscribe(listener);
        flipSystemScheme();
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it('stops firing after unsubscribe', () => {
        const listener = vi.fn();
        const unsubscribe = subscribe(listener);
        unsubscribe();
        notifyPreferenceChange();
        window.dispatchEvent(
            new StorageEvent('storage', { key: THEME_STORAGE_KEY })
        );
        flipSystemScheme();
        expect(listener).not.toHaveBeenCalled();
        expect(mediaChangeListeners.size).toBe(0);
    });
});

describe('themeOptions', () => {
    it('offers system, light, then dark', () => {
        expect(themeOptions.map((option) => option.value)).toEqual([
            'system',
            'light',
            'dark',
        ]);
    });

    it('gives every option a label and an icon', () => {
        for (const option of themeOptions) {
            expect(option.label).toBeTruthy();
            expect(typeof option.Icon).toBe('function');
        }
    });
});
