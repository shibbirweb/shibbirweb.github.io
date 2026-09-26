import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SearchResultsBody from '@/components/pages/articles/SearchResults/SearchResultsBody';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(index: number): ArticleSummary {
    return {
        slug: `article-${index}`,
        title: `Article ${index}`,
        description: '',
        date: '2026-01-10',
        tags: [],
        cover: `/images/articles/article-${index}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
    };
}

const createHref = (page: number) => `/articles/search?q=x&page=${page}`;

function cardTitles(): string[] {
    return screen
        .queryAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent ?? '');
}

describe('SearchResultsBody', () => {
    it('prompts to search when the query is empty', () => {
        render(
            <SearchResultsBody
                query=""
                results={[buildArticle(1)]}
                perPage={2}
                current={1}
                totalPages={1}
                createHref={createHref}
            />
        );

        expect(
            screen.getByText(
                'Open search to find an article by its title or a tag.'
            )
        ).toBeInTheDocument();
        expect(cardTitles()).toEqual([]);
    });

    it('shows the no-match line when the query found nothing', () => {
        render(
            <SearchResultsBody
                query="rust"
                results={[]}
                perPage={2}
                current={1}
                totalPages={1}
                createHref={createHref}
            />
        );

        expect(
            screen.getByText('Nothing matched. Try a different title or tag.')
        ).toBeInTheDocument();
    });

    it('renders only the current page of results with pagination', () => {
        render(
            <SearchResultsBody
                query="article"
                results={[buildArticle(1), buildArticle(2), buildArticle(3)]}
                perPage={2}
                current={2}
                totalPages={2}
                createHref={createHref}
            />
        );

        expect(cardTitles()).toEqual(['Article 3']);
        expect(screen.getByRole('link', { name: 'Prev' })).toHaveAttribute(
            'href',
            '/articles/search?q=x&page=1'
        );
    });

    it('omits pagination for a single page of results', () => {
        render(
            <SearchResultsBody
                query="article"
                results={[buildArticle(1)]}
                perPage={2}
                current={1}
                totalPages={1}
                createHref={createHref}
            />
        );

        expect(cardTitles()).toEqual(['Article 1']);
        expect(
            screen.queryByRole('navigation', { name: 'Article pages' })
        ).not.toBeInTheDocument();
    });
});
