import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticlesToolbar from '@/components/pages/articles/ArticlesToolbar';

describe('ArticlesToolbar', () => {
    it('shows the summary it is given', () => {
        render(<ArticlesToolbar summary={<p>3 articles</p>} />);

        expect(screen.getByText('3 articles')).toBeInTheDocument();
    });

    it('carries the layout toggle after the summary', () => {
        const { container } = render(
            <ArticlesToolbar summary={<p>3 articles</p>} />
        );

        const toggle = screen.getByRole('group', { name: 'Layout' });
        expect(container.firstElementChild?.lastElementChild).toBe(toggle);
    });
});
