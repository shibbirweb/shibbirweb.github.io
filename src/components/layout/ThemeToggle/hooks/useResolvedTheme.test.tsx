import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useResolvedTheme } from '@/components/layout/ThemeToggle/hooks/useResolvedTheme';

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

describe('useResolvedTheme', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reports light when nothing is applied and the OS is light', () => {
        const { result } = renderHook(() => useResolvedTheme());

        expect(result.current).toBe('light');
    });

    it('reads the theme already applied to <html>', () => {
        document.documentElement.dataset.theme = 'dark';

        const { result } = renderHook(() => useResolvedTheme());

        expect(result.current).toBe('dark');
    });

    it('falls back to the OS scheme when <html> has no theme', () => {
        stubColorScheme(true);

        const { result } = renderHook(() => useResolvedTheme());

        expect(result.current).toBe('dark');
    });

    it('updates on an in-tab preference change', () => {
        const { result } = renderHook(() => useResolvedTheme());

        act(() => {
            document.documentElement.dataset.theme = 'dark';
            window.dispatchEvent(new Event('themepreferencechange'));
        });

        expect(result.current).toBe('dark');
    });

    it('updates when the OS scheme flips', () => {
        const scheme = stubColorScheme(false);
        const { result } = renderHook(() => useResolvedTheme());

        act(() => {
            scheme.flip(true);
        });

        expect(result.current).toBe('dark');
    });
});
