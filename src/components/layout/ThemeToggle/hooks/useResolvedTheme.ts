'use client';

import { useEffect, useState } from 'react';
import {
    getResolvedTheme,
    subscribe,
    type Theme,
} from '@/components/layout/ThemeToggle/theme';

/**
 * Returns the theme on <html> ('light' | 'dark') and updates whenever it
 * changes: a choice in this tab, a cross-tab storage write, or an OS scheme
 * flip while no choice is saved. SSR-safe: starts at 'light' to match the server
 * markup and reads the real value after mount (the pre-paint ThemeScript has
 * already applied the correct theme to <html>).
 */
export function useResolvedTheme(): Theme {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        setTheme(getResolvedTheme());
        return subscribe(() => setTheme(getResolvedTheme()));
    }, []);

    return theme;
}
