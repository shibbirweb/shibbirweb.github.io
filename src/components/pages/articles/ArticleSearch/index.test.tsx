import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

describe('ArticleSearch', () => {
    it('mounts the modal only once the trigger is pressed', async () => {
        const user = userEvent.setup();
        render(<ArticleSearch articles={[]} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Search articles' })
        );

        expect(
            screen.getByRole('dialog', { name: 'Search articles' })
        ).toBeInTheDocument();
    });

    it('opens from the Ctrl+K shortcut', () => {
        render(<ArticleSearch articles={[]} />);

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('pre-fills the modal with initialQuery', async () => {
        const user = userEvent.setup();
        render(
            <ArticleSearch
                articles={[]}
                initialQuery="docker"
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Search articles' })
        );

        expect(screen.getByRole('combobox')).toHaveValue('docker');
    });

    it('unmounts the modal on Escape and returns focus to the trigger', async () => {
        const user = userEvent.setup();
        render(<ArticleSearch articles={[]} />);
        const trigger = screen.getByRole('button', { name: 'Search articles' });

        await user.click(trigger);
        await user.keyboard('{Escape}');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });
});
