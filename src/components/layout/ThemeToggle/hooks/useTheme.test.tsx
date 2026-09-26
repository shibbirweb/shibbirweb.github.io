import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTheme } from '@/components/layout/ThemeToggle/hooks/useTheme';

describe('useTheme', () => {
    it('reports system when nothing is stored', () => {
        const { result } = renderHook(() => useTheme());

        expect(result.current.preference).toBe('system');
    });

    it('reads the stored preference after mount', () => {
        window.localStorage.setItem('theme', 'light');

        const { result } = renderHook(() => useTheme());

        expect(result.current.preference).toBe('light');
    });

    it('treats an unknown stored value as system', () => {
        window.localStorage.setItem('theme', 'sepia');

        const { result } = renderHook(() => useTheme());

        expect(result.current.preference).toBe('system');
    });

    it('stores, applies, and reports a new preference', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setPreference('dark');
        });

        expect(result.current.preference).toBe('dark');
        expect(window.localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('resolves system to light when the OS is not dark', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setPreference('system');
        });

        expect(window.localStorage.getItem('theme')).toBe('system');
        expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('syncs every mounted instance on a change', () => {
        const first = renderHook(() => useTheme());
        const second = renderHook(() => useTheme());

        act(() => {
            first.result.current.setPreference('light');
        });

        expect(second.result.current.preference).toBe('light');
    });

    it('re-reads the preference on a cross-tab storage write', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            window.localStorage.setItem('theme', 'dark');
            window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));
        });

        expect(result.current.preference).toBe('dark');
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

        expect(result.current.preference).toBe('system');
    });
});
