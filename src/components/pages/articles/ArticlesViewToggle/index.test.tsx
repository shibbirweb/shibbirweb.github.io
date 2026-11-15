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
    it('is a labelled group offering grid then list', () => {
        render(<ArticlesViewToggle />);

        expect(
            screen.getByRole('group', { name: 'Layout' })
        ).toBeInTheDocument();
        expect(
            screen
                .getAllByRole('button')
                .map((button) => button.getAttribute('aria-label'))
        ).toEqual(['Grid view', 'List view']);
        expect(articlesViewOptions[0].view).toBe('grid');
    });

    it('presses the grid by default', () => {
        render(<ArticlesViewToggle />);

        expect(
            screen.getByRole('button', { name: 'Grid view' })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByRole('button', { name: 'List view' })
        ).toHaveAttribute('aria-pressed', 'false');
    });

    it('presses the saved layout', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'list');

        render(<ArticlesViewToggle />);

        expect(
            screen.getByRole('button', { name: 'List view' })
        ).toHaveAttribute('aria-pressed', 'true');
    });

    it('switches to the list and remembers it', async () => {
        const user = userEvent.setup();
        render(<ArticlesViewToggle />);

        await user.click(screen.getByRole('button', { name: 'List view' }));

        expect(
            screen.getByRole('button', { name: 'List view' })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(window.localStorage.getItem(ARTICLES_VIEW_STORAGE_KEY)).toBe(
            'list'
        );
    });
});
