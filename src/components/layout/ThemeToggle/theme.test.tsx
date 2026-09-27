import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { themeOptions } from '@/components/layout/ThemeToggle/options';
import {
    THEME_STORAGE_KEY,
    applyTheme,
    getResolvedTheme,
    getStoredTheme,
    getSystemTheme,
    notifyThemeChange,
    resolveTheme,
    storeTheme,
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

describe('stored theme', () => {
    it('is null when nothing is stored', () => {
        expect(getStoredTheme()).toBeNull();
    });

    it('reads back a stored light or dark choice', () => {
        storeTheme('dark');
        expect(getStoredTheme()).toBe('dark');
        storeTheme('light');
        expect(getStoredTheme()).toBe('light');
    });

    it('stores under the theme key', () => {
        storeTheme('dark');
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
        expect(THEME_STORAGE_KEY).toBe('theme');
    });

    it('treats an invalid stored value as no choice', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
        expect(getStoredTheme()).toBeNull();
    });

    it('treats the old system value as no choice', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
        expect(getStoredTheme()).toBeNull();
    });

    it('is null when storage cannot be read', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        expect(getStoredTheme()).toBeNull();
    });

    it('ignores storage write failures', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });
        expect(() => storeTheme('dark')).not.toThrow();
    });
});

describe('getSystemTheme', () => {
    it('follows the OS colour scheme', () => {
        stubSystemScheme(true);
        expect(getSystemTheme()).toBe('dark');
        stubSystemScheme(false);
        expect(getSystemTheme()).toBe('light');
    });
});

describe('resolveTheme', () => {
    it('uses the OS scheme for a first-time visitor', () => {
        stubSystemScheme(true);
        expect(resolveTheme()).toBe('dark');
        stubSystemScheme(false);
        expect(resolveTheme()).toBe('light');
    });

    it('keeps a saved choice regardless of the OS', () => {
        storeTheme('light');
        stubSystemScheme(true);
        expect(resolveTheme()).toBe('light');

        storeTheme('dark');
        stubSystemScheme(false);
        expect(resolveTheme()).toBe('dark');
    });

    it('falls back to the OS scheme for the old system value', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
        stubSystemScheme(true);
        expect(resolveTheme()).toBe('dark');
    });
});

describe('applyTheme', () => {
    it('writes the theme to data-theme and color-scheme', () => {
        applyTheme('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(document.documentElement.style.colorScheme).toBe('dark');

        applyTheme('light');
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
    it('fires on an in-tab theme change', () => {
        const listener = vi.fn();
        const unsubscribe = subscribe(listener);
        notifyThemeChange();
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
        notifyThemeChange();
        window.dispatchEvent(
            new StorageEvent('storage', { key: THEME_STORAGE_KEY })
        );
        flipSystemScheme();
        expect(listener).not.toHaveBeenCalled();
        expect(mediaChangeListeners.size).toBe(0);
    });
});

describe('themeOptions', () => {
    it('offers light, then dark', () => {
        expect(themeOptions.map((option) => option.value)).toEqual([
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
