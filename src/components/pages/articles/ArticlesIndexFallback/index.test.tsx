import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticlesIndexFallback from '@/components/pages/articles/ArticlesIndexFallback';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

const articles: ArticleSummary[] = Array.from(
    { length: ARTICLES_PER_PAGE + 1 },
    (_, index) => ({
        slug: `article-${index + 1}`,
        title: `Article ${index + 1}`,
        description: '',
        date: '2026-01-10',
        tags: ['AI'],
        cover: `/images/articles/article-${index + 1}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
    })
);

function renderFallback() {
    return render(
        <ArticlesIndexFallback
            articles={articles}
            tags={['AI']}
            seriesTotals={{}}
            totalPages={2}
        />
    );
}

describe('ArticlesIndexFallback', () => {
    it('shows every tag with All active', () => {
        renderFallback();

        expect(
            screen.getByRole('navigation', { name: 'Filter articles by tag' })
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'All' })).toHaveClass(
            'bg-foreground'
        );
    });

    it('counts every article and offers the layout toggle', () => {
        renderFallback();

        expect(
            screen.getByText(`${articles.length} articles`)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('group', { name: 'Layout' })
        ).toBeInTheDocument();
    });

    it('renders the first page in the default grid with pagination', () => {
        renderFallback();

        expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
            ARTICLES_PER_PAGE
        );
        expect(
            document.querySelectorAll('li[data-spotlight-surface] img')
        ).toHaveLength(ARTICLES_PER_PAGE);
        expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
            'href',
            '/articles?page=2'
        );
    });

    it('wraps the results, but not the tag filter, so a saved list can hide them', () => {
        renderFallback();

        const toggle = screen.getByRole('group', { name: 'Layout' });
        const wrapper = toggle.parentElement?.parentElement;
        expect(wrapper?.className).toMatch(/pendingResults/);
        expect(
            wrapper?.contains(
                screen.getByRole('navigation', {
                    name: 'Filter articles by tag',
                })
            )
        ).toBe(false);
    });
});
