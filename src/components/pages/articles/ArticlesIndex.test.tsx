import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArticlesIndex from '@/components/pages/articles/ArticlesIndex';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

vi.mock('next/navigation', () => ({
    usePathname: () => '/articles',
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ push: vi.fn() }),
}));

function buildArticle(
    index: number,
    extra: Partial<ArticleSummary> = {}
): ArticleSummary {
    return {
        slug: `article-${index}`,
        title: `Article ${index}`,
        description: '',
        date: '2026-01-10',
        tags: ['AI'],
        cover: `/images/articles/article-${index}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
        ...extra,
    };
}

describe('ArticlesIndex', () => {
    it('keeps the heading and intro for screen readers, but not on screen', () => {
        render(<ArticlesIndex articles={[buildArticle(1)]} />);

        const heading = screen.getByRole('heading', {
            level: 1,
            name: 'Articles',
        });
        expect(heading).toHaveClass('sr-only');
        expect(
            screen.getByText(
                'Real problems I ran into as a developer, and how I solved them.'
            )
        ).toHaveClass('sr-only');
    });

    it('puts search beside the breadcrumb', () => {
        render(<ArticlesIndex articles={[buildArticle(1)]} />);

        const search = screen.getByRole('button', { name: 'Search articles' });
        const breadcrumb = screen.getByRole('navigation', {
            name: 'Breadcrumb',
        });
        expect(search.closest('div')?.parentElement).toContainElement(
            breadcrumb
        );
    });

    it('renders the first page as rows, with pagination', () => {
        const articles = Array.from(
            { length: ARTICLES_PER_PAGE + 1 },
            (_, index) => buildArticle(index + 1)
        );

        render(<ArticlesIndex articles={articles} />);

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

    it('counts every article and presses the list view', () => {
        render(<ArticlesIndex articles={[buildArticle(1), buildArticle(2)]} />);

        expect(screen.getByText('2 articles')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'List view' })
        ).toHaveAttribute('aria-pressed', 'true');
    });

    it('keeps the topics folded behind Filters', () => {
        render(<ArticlesIndex articles={[buildArticle(1)]} />);

        expect(screen.getByRole('button', { name: /Filters/ })).toHaveAttribute(
            'aria-expanded',
            'false'
        );
        expect(
            screen.queryByRole('navigation', { name: 'Filter articles by tag' })
        ).not.toBeInTheDocument();
    });

    it('shows the latest series with a link to every series', () => {
        render(
            <ArticlesIndex
                articles={[
                    buildArticle(1, { series: { name: 'Home lab', order: 1 } }),
                    buildArticle(2),
                ]}
            />
        );

        expect(screen.getByRole('link', { name: /Home lab/ })).toHaveAttribute(
            'href',
            '/articles/article-1'
        );
        expect(
            screen.getByRole('link', { name: 'All series (1)' })
        ).toHaveAttribute('href', '/articles/series');
    });
});
