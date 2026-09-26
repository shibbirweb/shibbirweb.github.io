import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticlePager from '@/components/pages/articles/ArticlePager';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(slug: string, title: string): ArticleSummary {
    return {
        slug,
        title,
        description: '',
        date: '2026-01-10',
        tags: [],
        cover: `/images/articles/${slug}.svg`,
        coverColors: ['#123456', '#abcdef'],
        readingMinutes: 3,
    };
}

const older = buildArticle('older-post', 'The older post');
const newer = buildArticle('newer-post', 'The newer post');

describe('ArticlePager', () => {
    it('renders nothing without neighbours', () => {
        const { container } = render(<ArticlePager />);

        expect(container).toBeEmptyDOMElement();
    });

    it('links the previous (older) article with rel="prev"', () => {
        render(
            <ArticlePager
                previous={older}
                next={newer}
            />
        );

        const previousLink = screen.getByRole('link', { name: /Previous/ });
        expect(previousLink).toHaveAttribute('href', '/articles/older-post');
        expect(previousLink).toHaveAttribute('rel', 'prev');
        expect(previousLink).toHaveTextContent('The older post');
    });

    it('links the next article with rel="next"', () => {
        render(
            <ArticlePager
                previous={older}
                next={newer}
            />
        );

        const nextLink = screen.getByRole('link', { name: /Next/ });
        expect(nextLink).toHaveAttribute('href', '/articles/newer-post');
        expect(nextLink).toHaveAttribute('rel', 'next');
        expect(nextLink).toHaveTextContent('The newer post');
    });

    it('orders previous before next inside a labelled nav', () => {
        render(
            <ArticlePager
                previous={older}
                next={newer}
            />
        );

        const nav = screen.getByRole('navigation', { name: 'More articles' });
        const links = Array.from(nav.querySelectorAll('a'));
        expect(links.map((link) => link.getAttribute('rel'))).toEqual([
            'prev',
            'next',
        ]);
    });

    it('right-aligns Next only when a Previous card sits beside it', () => {
        const { rerender } = render(
            <ArticlePager
                previous={older}
                next={newer}
            />
        );
        expect(screen.getByRole('link', { name: /Next/ })).toHaveClass(
            'sm:col-start-2'
        );

        rerender(<ArticlePager next={newer} />);
        expect(screen.getByRole('link', { name: /Next/ })).not.toHaveClass(
            'sm:col-start-2'
        );
        expect(
            screen.queryByRole('link', { name: /Previous/ })
        ).not.toBeInTheDocument();
    });

    it('tints each card with the destination article accent', () => {
        render(<ArticlePager previous={older} />);

        const link = screen.getByRole('link', { name: /Previous/ });
        expect(link.style.getPropertyValue('--accent-from')).toBe('#123456');
    });
});
