import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
    return {
        slug: 'first-post',
        title: 'First post',
        description: 'A description.',
        date: '2026-01-10',
        tags: [],
        cover: '/images/articles/first-post.svg',
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
        ...overrides,
    };
}

describe('ArticleGrid', () => {
    it('renders one card per article, in order, inside a list', () => {
        render(
            <ArticleGrid
                articles={[
                    buildArticle({ slug: 'one', title: 'One' }),
                    buildArticle({ slug: 'two', title: 'Two' }),
                ]}
            />
        );

        const headings = screen.getAllByRole('heading', { level: 3 });
        expect(headings.map((heading) => heading.textContent)).toEqual([
            'One',
            'Two',
        ]);
        expect(screen.getAllByRole('list')[0].tagName).toBe('UL');
    });

    it('renders an empty list for no articles', () => {
        render(<ArticleGrid articles={[]} />);

        expect(
            screen.queryByRole('heading', { level: 3 })
        ).not.toBeInTheDocument();
    });

    it('passes each series total to its card for the "Part N of M" label', () => {
        render(
            <ArticleGrid
                articles={[
                    buildArticle({
                        slug: 'part-two',
                        title: 'Part two',
                        series: { name: 'Home lab', order: 2 },
                    }),
                    buildArticle({
                        slug: 'solo',
                        title: 'Solo',
                        series: { name: 'Unknown series', order: 1 },
                    }),
                ]}
                seriesTotals={{ 'Home lab': 3 }}
            />
        );

        expect(screen.getByText('Part 2 of 3')).toBeInTheDocument();
        expect(screen.getByText('Part 1')).toBeInTheDocument();
    });

    it('merges extra classes onto the grid', () => {
        const { container } = render(
            <ArticleGrid
                articles={[]}
                className="mt-10"
            />
        );

        expect(container.querySelector('ul')).toHaveClass('grid', 'mt-10');
    });
});
