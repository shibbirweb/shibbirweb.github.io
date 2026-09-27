'use client';

import { useEffect, useState } from 'react';
import {
    applyTheme,
    getResolvedTheme,
    notifyThemeChange,
    resolveTheme,
    storeTheme,
    subscribe,
    type Theme,
} from '@/components/layout/ThemeToggle/theme';

/**
 * Reads and updates the light/dark theme, keeping every mounted instance and the
 * <html> element in sync. SSR and the first client render both start at 'light'
 * so the markup matches; the real theme is read after mount from <html>, where
 * the pre-paint ThemeScript has already applied the saved choice or OS scheme.
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>('light');

    useEffect(() => {
        setThemeState(getResolvedTheme());
        // Re-sync on a choice (this or another instance), a cross-tab storage
        // write, or an OS scheme flip while no choice is saved.
        const sync = () => {
            const next = resolveTheme();
            setThemeState(next);
            applyTheme(next);
        };
        return subscribe(sync);
    }, []);

    const setTheme = (next: Theme) => {
        setThemeState(next);
        storeTheme(next);
        applyTheme(next);
        notifyThemeChange();
    };

    return { theme, setTheme };
}
