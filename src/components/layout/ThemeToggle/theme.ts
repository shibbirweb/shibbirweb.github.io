// Theme core: the single source of truth for the light/dark theme. Framework-
// agnostic and SSR-safe (every window/document/localStorage access is guarded),
// so it can be shared by the React hook, the pre-paint ThemeScript, and the
// Mermaid renderer without pulling any of them into each other.
//
// There are only two themes. A visitor who has never picked one gets the OS
// colour scheme (and keeps following it); once they pick light or dark, that
// choice is saved and wins over the OS from then on. What we write to <html> is
// always a concrete theme: data-theme drives the attribute selectors and
// style.color-scheme drives every light-dark() token.

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

// Fired on window when the theme changes in this tab, so every mounted consumer
// (both navbar toggles, the Mermaid renderer) re-reads it in sync.
const THEME_CHANGE_EVENT = 'themepreferencechange';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark';
}

/**
 * The visitor's saved choice, or null when they have never picked one. Anything
 * else in storage (including the old 'system' value) counts as no choice.
 */
export function getStoredTheme(): Theme | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isTheme(stored) ? stored : null;
    } catch {
        return null;
    }
}

export function storeTheme(theme: Theme): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore write failures (private mode, storage disabled).
    }
}

export function getSystemTheme(): Theme {
    const prefersDark =
        typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
    return prefersDark ? 'dark' : 'light';
}

/** The theme to show: the saved choice, or the OS scheme when there is none. */
export function resolveTheme(): Theme {
    return getStoredTheme() ?? getSystemTheme();
}

/**
 * Writes the theme to <html> so the CSS can react. Mirrors the inline pre-paint
 * script in ThemeScript; the two must stay aligned.
 */
export function applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
}

/** The theme currently on <html>, or the OS scheme when none is applied yet. */
export function getResolvedTheme(): Theme {
    if (typeof document !== 'undefined') {
        const current = document.documentElement.dataset.theme;
        if (isTheme(current)) return current;
    }
    return getSystemTheme();
}

/** Broadcasts an in-tab theme change so every consumer re-reads it. */
export function notifyThemeChange(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
}

/**
 * Subscribes to anything that can change the theme: an in-tab choice, a
 * cross-tab storage write, or an OS scheme flip (which only matters while no
 * choice is saved). Returns an unsubscribe function.
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
