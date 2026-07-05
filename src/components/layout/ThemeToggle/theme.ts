// Theme core: the single source of truth for the light/dark/system preference.
// Framework-agnostic and SSR-safe (every window/document/localStorage access is
// guarded), so it can be shared by the React hook, the pre-paint ThemeScript,
// and the Mermaid renderer without pulling any of them into each other.
//
// The stored value is the user's *preference* ('system' | 'light' | 'dark').
// What we write to <html> is the *resolved* theme ('light' | 'dark'): data-theme
// drives the attribute selectors and style.color-scheme drives every light-dark()
// token. Keeping the resolved theme on the element (never "system") means CSS
// only ever deals with a concrete light or dark, so no @media duplication.

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

// Fired on window when the preference changes in this tab, so every mounted
// consumer (both navbar toggles, the Mermaid renderer) re-reads it in sync.
const THEME_CHANGE_EVENT = 'themepreferencechange';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isPreference(value: unknown): value is ThemePreference {
    return value === 'system' || value === 'light' || value === 'dark';
}

export function getStoredPreference(): ThemePreference {
    if (typeof window === 'undefined') return 'system';
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isPreference(stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}

export function storePreference(preference: ThemePreference): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
        // Ignore write failures (private mode, storage disabled).
    }
}

function prefersDark(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia(DARK_QUERY).matches
    );
}

export function resolvePreference(preference: ThemePreference): ResolvedTheme {
    if (preference === 'light' || preference === 'dark') return preference;
    return prefersDark() ? 'dark' : 'light';
}

/**
 * Writes the resolved theme to <html> so the CSS can react. Mirrors the inline
 * pre-paint script in ThemeScript; the two must stay aligned.
 */
export function applyPreference(preference: ThemePreference): void {
    if (typeof document === 'undefined') return;
    const resolved = resolvePreference(preference);
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
}

export function getResolvedTheme(): ResolvedTheme {
    if (typeof document !== 'undefined') {
        const current = document.documentElement.dataset.theme;
        if (current === 'light' || current === 'dark') return current;
    }
    return prefersDark() ? 'dark' : 'light';
}

/** Broadcasts an in-tab preference change so every consumer re-reads it. */
export function notifyPreferenceChange(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
}

/**
 * Subscribes to anything that can change the resolved theme: an in-tab
 * preference change, a cross-tab storage write, or an OS scheme flip (which only
 * matters while the preference is 'system'). Returns an unsubscribe function.
 */
export function subscribe(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const media = window.matchMedia(DARK_QUERY);
    const onStorage = (event: StorageEvent) => {
        if (event.key === THEME_STORAGE_KEY) listener();
    };
    window.addEventListener(THEME_CHANGE_EVENT, listener);
    window.addEventListener('storage', onStorage);
    media.addEventListener('change', listener);
    return () => {
        window.removeEventListener(THEME_CHANGE_EVENT, listener);
        window.removeEventListener('storage', onStorage);
        media.removeEventListener('change', listener);
    };
}
