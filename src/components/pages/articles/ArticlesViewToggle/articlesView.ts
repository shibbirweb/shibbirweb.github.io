// The articles and series page layout preference: list (the default) or grid. A
// per-visitor convenience kept in localStorage, so every read and write is
// guarded (SSR, private mode, storage disabled) and a missing or odd value falls
// back to the list. Changes are broadcast in-tab with a custom event, and other tabs
// pick them up from the native storage event. The saved layout is also mirrored
// onto <html> as data-articles-view (first by the pre-paint ArticlesViewScript,
// then on every change, including one made in another tab) so CSS can hide the
// pre-rendered list from a visitor who chose the grid, instead of flashing it
// before their grid renders.

export type ArticlesView = 'grid' | 'list';

export const ARTICLES_VIEW_STORAGE_KEY = 'articles-view';
export const DEFAULT_ARTICLES_VIEW: ArticlesView = 'list';
export const ARTICLES_VIEW_ATTRIBUTE = 'data-articles-view';

const ARTICLES_VIEW_CHANGE_EVENT = 'articlesviewchange';

export function isArticlesView(value: unknown): value is ArticlesView {
    return value === 'grid' || value === 'list';
}

/** The saved layout, or the list when nothing valid is saved. */
export function getStoredArticlesView(): ArticlesView {
    if (typeof window === 'undefined') {
        return DEFAULT_ARTICLES_VIEW;
    }
    try {
        const stored = window.localStorage.getItem(ARTICLES_VIEW_STORAGE_KEY);
        return isArticlesView(stored) ? stored : DEFAULT_ARTICLES_VIEW;
    } catch {
        return DEFAULT_ARTICLES_VIEW;
    }
}

/** Mirrors the layout onto <html>, matching the pre-paint ArticlesViewScript. */
export function applyArticlesView(view: ArticlesView): void {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.setAttribute(ARTICLES_VIEW_ATTRIBUTE, view);
}

/** Saves the layout, mirrors it onto <html>, and tells every reader in this tab. */
export function storeArticlesView(view: ArticlesView): void {
    try {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, view);
    } catch {
        // Ignore write failures; the choice still applies until reload.
    }
    applyArticlesView(view);
    window.dispatchEvent(new Event(ARTICLES_VIEW_CHANGE_EVENT));
}

/** Calls `onChange` when the layout changes in this tab or another one. */
export function subscribeToArticlesView(onChange: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
        if (event.key === ARTICLES_VIEW_STORAGE_KEY) {
            applyArticlesView(getStoredArticlesView());
            onChange();
        }
    };
    window.addEventListener(ARTICLES_VIEW_CHANGE_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener(ARTICLES_VIEW_CHANGE_EVENT, onChange);
        window.removeEventListener('storage', onStorage);
    };
}
