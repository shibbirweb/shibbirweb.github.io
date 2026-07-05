'use client';

import { useEffect, useState } from 'react';
import {
    applyPreference,
    getStoredPreference,
    notifyPreferenceChange,
    storePreference,
    subscribe,
    type ThemePreference,
} from '@/components/layout/ThemeToggle/theme';

/**
 * Reads and updates the theme preference, keeping every mounted instance and the
 * <html> element in sync. SSR and the first client render both start at 'system'
 * so the markup matches; the stored value is read after mount to avoid a
 * hydration mismatch (the pre-paint ThemeScript has already applied it to the DOM).
 */
export function useTheme() {
    const [preference, setPreferenceState] = useState<ThemePreference>('system');

    useEffect(() => {
        setPreferenceState(getStoredPreference());
        // Re-sync on a preference change (this or another instance), a cross-tab
        // storage write, or an OS scheme flip while on 'system'.
        const sync = () => {
            const next = getStoredPreference();
            setPreferenceState(next);
            applyPreference(next);
        };
        return subscribe(sync);
    }, []);

    const setPreference = (next: ThemePreference) => {
        setPreferenceState(next);
        storePreference(next);
        applyPreference(next);
        notifyPreferenceChange();
    };

    return { preference, setPreference };
}
