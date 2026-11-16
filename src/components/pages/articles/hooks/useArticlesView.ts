'use client';

import { useSyncExternalStore } from 'react';
import {
    DEFAULT_ARTICLES_VIEW,
    getStoredArticlesView,
    storeArticlesView,
    subscribeToArticlesView,
    type ArticlesView,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';

/**
 * The articles page layout (list or grid) and a setter that saves it. Every
 * mounted reader (the toggle and the list it controls) stays in sync through
 * the shared store. The server snapshot is the default list, so pre-rendered
 * markup always shows the default layout.
 */
export function useArticlesView(): {
    view: ArticlesView;
    setView: (view: ArticlesView) => void;
} {
    const view = useSyncExternalStore(
        subscribeToArticlesView,
        getStoredArticlesView,
        () => DEFAULT_ARTICLES_VIEW
    );

    return { view, setView: storeArticlesView };
}
