import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleCard from '@/components/pages/articles/ArticleCard';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
    return {
        slug: 'static-deploys',
        title: 'Static deploys on GitHub Pages',
        description: 'Shipping a static export without a server.',
        date: '2026-03-14',
        tags: ['Next.js', 'CI/CD'],
        cover: '/images/articles/static-deploys.svg',
        coverColors: ['#112233', '#445566'],
        readingMinutes: 7,
        ...overrides,
    };
}

describe('ArticleCard', () => {
    it('links the card to the article page by slug', () => {
        render(<ArticleCard article={buildArticle()} />);

        const link = screen.getByRole('link', {
            name: /Static deploys on GitHub Pages/,
        });
        expect(link).toHaveAttribute('href', '/articles/static-deploys');
    });

    it('shows the title as a heading, the description, and the reading time', () => {
        render(<ArticleCard article={buildArticle()} />);

        expect(
            screen.getByRole('heading', {
                level: 3,
                name: 'Static deploys on GitHub Pages',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Shipping a static export without a server.')
        ).toBeInTheDocument();
        expect(screen.getByText(/7 min read/)).toBeInTheDocument();
    });

    it('formats the publish date and keeps the ISO value on the time element', () => {
        const { container } = render(<ArticleCard article={buildArticle()} />);

        const time = container.querySelector('time');
        expect(time).toHaveAttribute('dateTime', '2026-03-14');
        expect(time).toHaveTextContent('Mar 14, 2026');
    });

    it('renders every tag as a filter link to the tagged listing', () => {
        render(<ArticleCard article={buildArticle()} />);

        expect(screen.getByRole('link', { name: 'Next.js' })).toHaveAttribute(
            'href',
            '/articles?tag=Next.js'
        );
        expect(screen.getByRole('link', { name: 'CI/CD' })).toHaveAttribute(
            'href',
            '/articles?tag=CI%2FCD'
        );
    });

    it('exposes the cover colours as custom properties on the card', () => {
        const { container } = render(<ArticleCard article={buildArticle()} />);

        const card = container.querySelector('li[data-spotlight-surface]');
        expect(card).not.toBeNull();
        const style = (card as HTMLElement).style;
        expect(style.getPropertyValue('--cover-from')).toBe('#112233');
        expect(style.getPropertyValue('--cover-to')).toBe('#445566');
        expect(style.getPropertyValue('--accent-from')).toBe('#112233');
        expect(style.getPropertyValue('--accent-to')).toBe('#445566');
    });

    it('renders the cover image with an empty alt so it stays decorative', () => {
        const { container } = render(<ArticleCard article={buildArticle()} />);

        const image = container.querySelector('img');
        expect(image).toHaveAttribute('alt', '');
        expect(image?.getAttribute('src')).toContain('static-deploys.svg');
    });

    it('omits the series badge for a standalone article', () => {
        render(<ArticleCard article={buildArticle()} />);

        expect(screen.queryByText(/^Part \d/)).not.toBeInTheDocument();
    });

    it('shows the series badge with the published part count when given', () => {
        render(
            <ArticleCard
                article={buildArticle({
                    series: { name: 'Home lab', order: 2 },
                })}
                seriesTotal={4}
            />
        );

        expect(screen.getByText('Part 2 of 4')).toBeInTheDocument();
        expect(screen.getByText('Home lab')).toBeInTheDocument();
    });
});
