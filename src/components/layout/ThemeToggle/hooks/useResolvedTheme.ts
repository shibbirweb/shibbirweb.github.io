'use client';

import { useEffect, useState } from 'react';
import {
    getResolvedTheme,
    subscribe,
    type ResolvedTheme,
} from '@/components/layout/ThemeToggle/theme';

/**
 * Returns the concrete resolved theme ('light' | 'dark') and updates whenever it
 * changes: a preference switch in this tab, a cross-tab storage write, or an OS
 * scheme flip while on 'system'. SSR-safe: starts at 'light' to match the server
 * markup and reads the real value after mount (the pre-paint ThemeScript has
 * already applied the correct theme to <html>).
 */
export function useResolvedTheme(): ResolvedTheme {
    const [theme, setTheme] = useState<ResolvedTheme>('light');

    useEffect(() => {
        setTheme(getResolvedTheme());
        return subscribe(() => setTheme(getResolvedTheme()));
    }, []);

    return theme;
}
