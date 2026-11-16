import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticlesToolbar from '@/components/pages/articles/ArticlesToolbar';

describe('ArticlesToolbar', () => {
    it('shows the summary it is given', () => {
        render(<ArticlesToolbar summary={<p>3 articles</p>} />);

        expect(screen.getByText('3 articles')).toBeInTheDocument();
    });

    it('carries the layout toggle after the summary, kept to the right', () => {
        const { container } = render(
            <ArticlesToolbar summary={<p>3 articles</p>} />
        );

        const toggle = screen.getByRole('group', { name: 'Layout' });
        const toggleSlot = container.firstElementChild?.lastElementChild;
        expect(toggleSlot).toContainElement(toggle);
        expect(toggleSlot).toHaveClass('ml-auto');
    });
});
