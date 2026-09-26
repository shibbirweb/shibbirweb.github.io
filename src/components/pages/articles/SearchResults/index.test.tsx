import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchResults from '@/components/pages/articles/SearchResults';
import type { ArticleSummary } from '@/lib/posts';

const navigation = vi.hoisted(() => ({
    searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => navigation.searchParams,
    useRouter: () => ({ push: vi.fn() }),
}));

function buildArticle(index: number, title: string): ArticleSummary {
    return {
        slug: `article-${index}`,
        title,
        description: '',
        date: `2026-01-${String(10 + index).padStart(2, '0')}`,
        tags: [],
        cover: `/images/articles/article-${index}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
    };
}

const articles = [
    buildArticle(1, 'Docker basics'),
    buildArticle(2, 'Docker volumes'),
    buildArticle(3, 'Docker networks'),
    buildArticle(4, 'WireGuard tunnels'),
];

function cardTitles(): string[] {
    return screen
        .queryAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent ?? '');
}

afterEach(() => {
    navigation.searchParams = new URLSearchParams();
});

describe('SearchResults', () => {
    it('prompts to search when there is no ?q=', () => {
        render(
            <SearchResults
                articles={articles}
                perPage={2}
            />
        );

        expect(
            screen.getByText(
                'Open search to find an article by its title or a tag.'
            )
        ).toBeInTheDocument();
    });

    it('labels the result count with the quoted query', () => {
        navigation.searchParams = new URLSearchParams('q=docker');

        render(
            <SearchResults
                articles={articles}
                perPage={2}
            />
        );

        expect(screen.getByText(/3 articles found for/)).toHaveTextContent(
            '3 articles found for “docker”'
        );
    });

    it('paginates matches and keeps the query in page links', () => {
        navigation.searchParams = new URLSearchParams('q=docker');

        render(
            <SearchResults
                articles={articles}
                perPage={2}
            />
        );

        expect(cardTitles()).toHaveLength(2);
        expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
            'href',
            '/articles/search?q=docker&page=2'
        );
    });

    it('falls back to page one for an out-of-range ?page=', () => {
        navigation.searchParams = new URLSearchParams('q=docker&page=9');

        render(
            <SearchResults
                articles={articles}
                perPage={2}
            />
        );

        expect(screen.getByRole('link', { name: '1' })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('reports no matches for an unmatched query', () => {
        navigation.searchParams = new URLSearchParams('q=kubernetes');

        render(
            <SearchResults
                articles={articles}
                perPage={2}
            />
        );

        expect(screen.getByText(/No articles found for/)).toBeInTheDocument();
        expect(
            screen.getByText('Nothing matched. Try a different title or tag.')
        ).toBeInTheDocument();
    });
});
