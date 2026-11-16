import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
    DEFAULT_ARTICLES_VIEW,
    applyArticlesView,
    getStoredArticlesView,
    isArticlesView,
    storeArticlesView,
    subscribeToArticlesView,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';

afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(ARTICLES_VIEW_ATTRIBUTE);
    vi.restoreAllMocks();
});

describe('articlesView', () => {
    it('defaults to the list', () => {
        expect(DEFAULT_ARTICLES_VIEW).toBe('list');
    });

    it.each([
        ['grid', true],
        ['list', true],
        ['table', false],
        [null, false],
        [undefined, false],
    ])('recognises %j as a layout: %s', (value, expected) => {
        expect(isArticlesView(value)).toBe(expected);
    });

    it('reads the list when nothing is saved', () => {
        expect(getStoredArticlesView()).toBe('list');
    });

    it('reads a saved grid choice', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'grid');

        expect(getStoredArticlesView()).toBe('grid');
    });

    it('falls back to the list for an unknown saved value', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'cards');

        expect(getStoredArticlesView()).toBe('list');
    });

    it('falls back to the list when storage cannot be read', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });

        expect(getStoredArticlesView()).toBe('list');
    });

    it('saves the choice and mirrors it onto <html>', () => {
        storeArticlesView('list');

        expect(window.localStorage.getItem(ARTICLES_VIEW_STORAGE_KEY)).toBe(
            'list'
        );
        expect(
            document.documentElement.getAttribute(ARTICLES_VIEW_ATTRIBUTE)
        ).toBe('list');
    });

    it('still applies the choice when storage cannot be written', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });

        expect(() => storeArticlesView('list')).not.toThrow();
        expect(
            document.documentElement.getAttribute(ARTICLES_VIEW_ATTRIBUTE)
        ).toBe('list');
    });

    it('writes the layout attribute on <html>', () => {
        applyArticlesView('grid');

        expect(
            document.documentElement.getAttribute(ARTICLES_VIEW_ATTRIBUTE)
        ).toBe('grid');
    });

    it('notifies subscribers of a change in this tab', () => {
        const onChange = vi.fn();
        const unsubscribe = subscribeToArticlesView(onChange);

        storeArticlesView('list');

        expect(onChange).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it('picks up a change made in another tab and mirrors it onto <html>', () => {
        const onChange = vi.fn();
        const unsubscribe = subscribeToArticlesView(onChange);
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'list');

        window.dispatchEvent(
            new StorageEvent('storage', { key: ARTICLES_VIEW_STORAGE_KEY })
        );

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(
            document.documentElement.getAttribute(ARTICLES_VIEW_ATTRIBUTE)
        ).toBe('list');
        unsubscribe();
    });

    it('ignores storage events for other keys', () => {
        const onChange = vi.fn();
        const unsubscribe = subscribeToArticlesView(onChange);

        window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));

        expect(onChange).not.toHaveBeenCalled();
        unsubscribe();
    });

    it('stops notifying after unsubscribing', () => {
        const onChange = vi.fn();
        subscribeToArticlesView(onChange)();

        storeArticlesView('grid');

        expect(onChange).not.toHaveBeenCalled();
    });
});
