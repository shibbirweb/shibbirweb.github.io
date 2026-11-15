import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleRowList from '@/components/pages/articles/ArticleRowList';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(
    index: number,
    overrides: Partial<ArticleSummary> = {}
): ArticleSummary {
    return {
        slug: `article-${index}`,
        title: `Article ${index}`,
        description: `Description ${index}.`,
        date: '2026-01-10',
        tags: ['AI'],
        cover: `/images/articles/article-${index}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
        ...overrides,
    };
}

describe('ArticleRowList', () => {
    it('renders one row per article, in order', () => {
        render(
            <ArticleRowList
                articles={[1, 2, 3].map((index) => buildArticle(index))}
            />
        );

        expect(
            screen
                .getAllByRole('heading', { level: 3 })
                .map((heading) => heading.textContent)
        ).toEqual(['Article 1', 'Article 2', 'Article 3']);
    });

    it('lays the rows out as a single stacked list', () => {
        render(<ArticleRowList articles={[buildArticle(1)]} />);

        expect(screen.getAllByRole('list')[0]).toHaveClass('flex', 'flex-col');
    });

    it('passes each series article its published total', () => {
        render(
            <ArticleRowList
                articles={[
                    buildArticle(1, { series: { name: 'Home lab', order: 1 } }),
                ]}
                seriesTotals={{ 'Home lab': 2 }}
            />
        );

        expect(screen.getByText('Part 1 of 2')).toBeInTheDocument();
    });

    it('merges a caller className', () => {
        render(
            <ArticleRowList
                articles={[buildArticle(1)]}
                className="mt-10"
            />
        );

        expect(screen.getAllByRole('list')[0]).toHaveClass('mt-10');
        expect(screen.getAllByRole('list')[0]).not.toHaveClass('mt-6');
    });
});
