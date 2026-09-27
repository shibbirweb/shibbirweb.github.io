import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from '@/components/layout/ThemeToggle/hooks/useTheme';

type ChangeListener = () => void;

/** Stubs matchMedia with a controllable dark-scheme query. */
function stubColorScheme(initiallyDark: boolean) {
    const listeners: ChangeListener[] = [];
    const state = { dark: initiallyDark };
    vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
            ({
                get matches() {
                    return (
                        query === '(prefers-color-scheme: dark)' && state.dark
                    );
                },
                media: query,
                addEventListener: (_type: string, listener: ChangeListener) => {
                    listeners.push(listener);
                },
                removeEventListener: () => {},
            }) as unknown as MediaQueryList
    );
    return {
        flip(dark: boolean) {
            state.dark = dark;
            listeners.forEach((listener) => listener());
        },
    };
}

describe('useTheme', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reports the OS scheme when nothing is stored', () => {
        stubColorScheme(true);

        const { result } = renderHook(() => useTheme());

        expect(result.current.theme).toBe('dark');
    });

    it('reads the theme the pre-paint script applied', () => {
        document.documentElement.dataset.theme = 'dark';

        const { result } = renderHook(() => useTheme());

        expect(result.current.theme).toBe('dark');
    });

    it('stores, applies, and reports a new theme', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('dark');
        });

        expect(result.current.theme).toBe('dark');
        expect(window.localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('follows an OS scheme flip while nothing is stored', () => {
        const scheme = stubColorScheme(false);
        const { result } = renderHook(() => useTheme());

        act(() => {
            scheme.flip(true);
        });

        expect(result.current.theme).toBe('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('keeps a saved choice when the OS scheme flips', () => {
        const scheme = stubColorScheme(false);
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('light');
        });
        act(() => {
            scheme.flip(true);
        });

        expect(result.current.theme).toBe('light');
        expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('syncs every mounted instance on a change', () => {
        const first = renderHook(() => useTheme());
        const second = renderHook(() => useTheme());

        act(() => {
            first.result.current.setTheme('dark');
        });

        expect(second.result.current.theme).toBe('dark');
    });

    it('re-reads the theme on a cross-tab storage write', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            window.localStorage.setItem('theme', 'dark');
            window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));
        });

        expect(result.current.theme).toBe('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('ignores storage writes to other keys', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            window.localStorage.setItem('theme', 'dark');
            window.dispatchEvent(
                new StorageEvent('storage', { key: 'something-else' })
            );
        });

        expect(result.current.theme).toBe('light');
    });
});
