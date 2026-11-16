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
            seriesTotals={{}}
            totalPages={2}
        />
    );
}

describe('ArticlesIndexFallback', () => {
    it('ships the Filters button with the topics folded away', () => {
        renderFallback();

        expect(screen.getByRole('button', { name: /Filters/ })).toHaveAttribute(
            'aria-expanded',
            'false'
        );
        expect(
            screen.getByRole('navigation', {
                name: 'Filter articles by tag',
                hidden: true,
            })
        ).toBeInTheDocument();
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

    it('renders the first page in the default list with pagination', () => {
        renderFallback();

        expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
            ARTICLES_PER_PAGE
        );
        expect(
            document.querySelectorAll('li[data-spotlight-surface] img')
        ).toHaveLength(0);
        expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
            'href',
            '/articles?page=2'
        );
    });

    it('wraps the results, but not the browse bar, so a saved grid can hide them', () => {
        renderFallback();

        const toggle = screen.getByRole('group', { name: 'Layout' });
        const wrapper = toggle.closest('[class*="pendingResults"]');
        expect(wrapper).not.toBeNull();
        expect(
            wrapper?.contains(screen.getByRole('button', { name: /Filters/ }))
        ).toBe(false);
    });
});
