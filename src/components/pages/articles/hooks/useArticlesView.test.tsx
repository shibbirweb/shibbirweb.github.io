import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import { useArticlesView } from '@/components/pages/articles/hooks/useArticlesView';

afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(ARTICLES_VIEW_ATTRIBUTE);
});

describe('useArticlesView', () => {
    it('starts on the list when nothing is saved', () => {
        const { result } = renderHook(() => useArticlesView());

        expect(result.current.view).toBe('list');
    });

    it('starts on the saved layout', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'grid');

        const { result } = renderHook(() => useArticlesView());

        expect(result.current.view).toBe('grid');
    });

    it('switches and saves the layout', () => {
        const { result } = renderHook(() => useArticlesView());

        act(() => result.current.setView('grid'));

        expect(result.current.view).toBe('grid');
        expect(window.localStorage.getItem(ARTICLES_VIEW_STORAGE_KEY)).toBe(
            'grid'
        );
    });

    it('keeps every mounted reader in sync', () => {
        const toggle = renderHook(() => useArticlesView());
        const results = renderHook(() => useArticlesView());

        act(() => toggle.result.current.setView('grid'));

        expect(results.result.current.view).toBe('grid');
    });
});
