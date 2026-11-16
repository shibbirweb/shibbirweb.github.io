import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import ArticlesViewToggle from '@/components/pages/articles/ArticlesViewToggle';
import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import { articlesViewOptions } from '@/components/pages/articles/ArticlesViewToggle/contents';

afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(ARTICLES_VIEW_ATTRIBUTE);
});

describe('ArticlesViewToggle', () => {
    it('is a labelled group offering list then grid', () => {
        render(<ArticlesViewToggle />);

        expect(
            screen.getByRole('group', { name: 'Layout' })
        ).toBeInTheDocument();
        expect(
            screen
                .getAllByRole('button')
                .map((button) => button.getAttribute('aria-label'))
        ).toEqual(['List view', 'Grid view']);
        expect(articlesViewOptions[0].view).toBe('list');
    });

    it('presses the list by default', () => {
        render(<ArticlesViewToggle />);

        expect(
            screen.getByRole('button', { name: 'List view' })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByRole('button', { name: 'Grid view' })
        ).toHaveAttribute('aria-pressed', 'false');
    });

    it('presses the saved layout', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'grid');

        render(<ArticlesViewToggle />);

        expect(
            screen.getByRole('button', { name: 'Grid view' })
        ).toHaveAttribute('aria-pressed', 'true');
    });

    it('switches to the grid and remembers it', async () => {
        const user = userEvent.setup();
        render(<ArticlesViewToggle />);

        await user.click(screen.getByRole('button', { name: 'Grid view' }));

        expect(
            screen.getByRole('button', { name: 'Grid view' })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(window.localStorage.getItem(ARTICLES_VIEW_STORAGE_KEY)).toBe(
            'grid'
        );
    });
});
