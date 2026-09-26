import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArticlesIndex from '@/components/pages/articles/ArticlesIndex';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

vi.mock('next/navigation', () => ({
    usePathname: () => '/articles',
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ push: vi.fn() }),
}));

function buildArticle(index: number): ArticleSummary {
    return {
        slug: `article-${index}`,
        title: `Article ${index}`,
        description: '',
        date: '2026-01-10',
        tags: ['AI'],
        cover: `/images/articles/article-${index}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
    };
}

describe('ArticlesIndex', () => {
    it('renders the page heading, search, tag filter, and first page', () => {
        const articles = Array.from(
            { length: ARTICLES_PER_PAGE + 1 },
            (_, index) => buildArticle(index + 1)
        );

        render(
            <ArticlesIndex
                articles={articles}
                tags={['AI']}
            />
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'Articles' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Search articles' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('navigation', { name: 'Filter articles by tag' })
        ).toBeInTheDocument();
        expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
            ARTICLES_PER_PAGE
        );
        expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
            'href',
            '/articles?page=2'
        );
    });
});
