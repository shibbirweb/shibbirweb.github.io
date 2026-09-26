import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArticlesSearch from '@/components/pages/articles/ArticlesSearch';

vi.mock('next/navigation', () => ({
    usePathname: () => '/articles/search',
    useSearchParams: () => new URLSearchParams('q=docker'),
    useRouter: () => ({ push: vi.fn() }),
}));

describe('ArticlesSearch', () => {
    it('renders the search page heading and the results for ?q=', () => {
        render(
            <ArticlesSearch
                articles={[
                    {
                        slug: 'docker-basics',
                        title: 'Docker basics',
                        description: '',
                        date: '2026-01-10',
                        tags: [],
                        cover: '/images/articles/docker-basics.svg',
                        coverColors: ['#000000', '#ffffff'],
                        readingMinutes: 3,
                    },
                ]}
            />
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'Search articles' })
        ).toBeInTheDocument();
        expect(screen.getByText(/1 article found for/)).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /Docker basics/ })
        ).toHaveAttribute('href', '/articles/docker-basics');
    });
});
