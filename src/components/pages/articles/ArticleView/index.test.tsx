import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ArticleView from '@/components/pages/articles/ArticleView';
import type { Article, ArticleSeries, ArticleSummary } from '@/lib/posts';

vi.mock('next/navigation', () => ({
    usePathname: () => '/articles/pi-hole-setup',
}));

function buildSummary(slug: string, title: string): ArticleSummary {
    return {
        slug,
        title,
        description: `${title} description.`,
        date: '2026-01-10',
        tags: [],
        cover: `/images/articles/${slug}.svg`,
        coverColors: ['#111111', '#222222'],
        readingMinutes: 4,
    };
}

function buildArticle(overrides: Partial<Article> = {}): Article {
    return {
        ...buildSummary('pi-hole-setup', 'Pi-hole setup'),
        description: 'Blocking ads for the whole network.',
        tags: ['DNS', 'Self Hosting'],
        difficulty: 'Beginner',
        html: '<h2 id="why">Why</h2><p>Because ads.</p>',
        toc: [{ id: 'why', text: 'Why', level: 2 }],
        learn: ['Point the router at Pi-hole'],
        tech: ['Pi-hole', 'Docker'],
        ...overrides,
    };
}

const series: ArticleSeries = {
    name: 'Home network',
    parts: [
        {
            slug: 'pi-hole-setup',
            title: 'Pi-hole setup',
            order: 1,
            isCurrent: true,
        },
        { slug: 'wireguard', title: 'WireGuard', order: 2, isCurrent: false },
    ],
};

const originalScrollTo = Element.prototype.scrollTo;

beforeEach(() => {
    Element.prototype.scrollTo = vi.fn();
});

afterEach(() => {
    Element.prototype.scrollTo = originalScrollTo;
});

describe('ArticleView', () => {
    it('renders the header: title, description, meta, tags, and stack', () => {
        render(
            <ArticleView
                article={buildArticle()}
                related={[]}
                series={null}
            />
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'Pi-hole setup' })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Blocking ads for the whole network.')
        ).toBeInTheDocument();
        expect(screen.getByText('Beginner')).toBeInTheDocument();
        expect(screen.getByText('4 min read')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Self Hosting' })
        ).toHaveAttribute('href', '/articles?tag=Self%20Hosting');
        expect(screen.getByText('Stack')).toBeInTheDocument();
    });

    it('renders the article body HTML inside the article element', () => {
        render(
            <ArticleView
                article={buildArticle()}
                related={[]}
                series={null}
            />
        );

        const article = screen.getByRole('article');
        expect(within(article).getByText('Because ads.')).toBeInTheDocument();
        expect(
            screen.getByRole('progressbar', { name: 'Reading progress' })
        ).toBeInTheDocument();
    });

    it('shows the series tracker and takeaways only when present', () => {
        const { rerender } = render(
            <ArticleView
                article={buildArticle()}
                related={[]}
                series={series}
            />
        );
        expect(
            screen.getByRole('region', { name: 'Series: Home network' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('region', { name: 'What you’ll learn' })
        ).toBeInTheDocument();

        rerender(
            <ArticleView
                article={buildArticle({ learn: [], tech: [] })}
                related={[]}
                series={null}
            />
        );
        expect(
            screen.queryByRole('region', { name: /Series:/ })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('region', { name: 'What you’ll learn' })
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Stack')).not.toBeInTheDocument();
    });

    it('places the share menu, pager, and comments after the body', () => {
        render(
            <ArticleView
                article={buildArticle()}
                related={[]}
                series={null}
                previous={buildSummary('older', 'Older post')}
                next={buildSummary('newer', 'Newer post')}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Share this article' })
        ).toBeInTheDocument();
        const pager = screen.getByRole('navigation', { name: 'More articles' });
        expect(
            within(pager).getByRole('link', { name: /Older post/ })
        ).toHaveAttribute('rel', 'prev');
        expect(
            screen.getByRole('region', { name: 'Comments' })
        ).toBeInTheDocument();
    });

    it('lists related articles only when there are some', () => {
        const { rerender } = render(
            <ArticleView
                article={buildArticle()}
                related={[]}
                series={null}
            />
        );
        expect(
            screen.queryByRole('complementary', { name: 'Related articles' })
        ).not.toBeInTheDocument();

        rerender(
            <ArticleView
                article={buildArticle()}
                related={[buildSummary('wireguard', 'WireGuard')]}
                series={null}
            />
        );
        const related = screen.getByRole('complementary', {
            name: 'Related articles',
        });
        expect(
            within(related).getByRole('link', { name: /WireGuard/ })
        ).toHaveAttribute('href', '/articles/wireguard');
    });

    it('leaves the JSON-LD out outside production', () => {
        const { container } = render(
            <ArticleView
                article={buildArticle()}
                related={[]}
                series={null}
            />
        );

        expect(
            container.querySelector('script[type="application/ld+json"]')
        ).toBeNull();
    });
});
