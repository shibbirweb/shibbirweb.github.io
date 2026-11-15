import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ArticlesViewScript from '@/components/pages/articles/ArticlesViewToggle/ArticlesViewScript';
import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';

// React never executes an inline script it renders, so run the shipped source
// directly, the way the browser does before first paint.
function runInlineScript() {
    const { container } = render(<ArticlesViewScript />);
    const source = container.querySelector('script')?.innerHTML ?? '';
    new Function(source)();
}

afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(ARTICLES_VIEW_ATTRIBUTE);
});

describe('ArticlesViewScript', () => {
    it('renders one inline script', () => {
        const { container } = render(<ArticlesViewScript />);

        expect(container.querySelectorAll('script')).toHaveLength(1);
    });

    it('marks <html> with a saved list choice', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'list');

        runInlineScript();

        expect(
            document.documentElement.getAttribute(ARTICLES_VIEW_ATTRIBUTE)
        ).toBe('list');
    });

    it('marks <html> with a saved grid choice', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'grid');

        runInlineScript();

        expect(
            document.documentElement.getAttribute(ARTICLES_VIEW_ATTRIBUTE)
        ).toBe('grid');
    });

    it('leaves <html> unmarked when nothing valid is saved', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'cards');

        runInlineScript();

        expect(
            document.documentElement.hasAttribute(ARTICLES_VIEW_ATTRIBUTE)
        ).toBe(false);
    });
});
