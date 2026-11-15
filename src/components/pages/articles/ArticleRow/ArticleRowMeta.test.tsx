import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleRowMeta from '@/components/pages/articles/ArticleRow/ArticleRowMeta';

describe('ArticleRowMeta', () => {
    it('shows the label and the reading time with one separator', () => {
        const { container } = render(
            <ArticleRowMeta
                label="Homelab"
                readingMinutes={24}
            />
        );

        expect(container).toHaveTextContent('Homelab/24 min read');
        expect(screen.getAllByText('/')).toHaveLength(1);
    });

    it('adds the series part as a third item', () => {
        const { container } = render(
            <ArticleRowMeta
                label="Homelab"
                readingMinutes={24}
                seriesPart="Part 2 of 3"
            />
        );

        expect(container).toHaveTextContent('Homelab/24 min read/Part 2 of 3');
    });

    it('starts with the reading time when there is no label', () => {
        const { container } = render(<ArticleRowMeta readingMinutes={5} />);

        expect(container).toHaveTextContent(/^5 min read$/);
        expect(screen.queryByText('/')).not.toBeInTheDocument();
    });

    it('hides the separators from assistive tech', () => {
        render(
            <ArticleRowMeta
                label="Backend"
                readingMinutes={20}
            />
        );

        expect(screen.getByText('/')).toHaveAttribute('aria-hidden', 'true');
    });
});
