import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ArticlesArea from '@/components/pages/home/ArticlesArea';
import { getAllArticles, getLatestArticles } from '@/lib/posts';
import type { ArticleSummary } from '@/lib/posts';

vi.mock('@/lib/posts', () => ({
    getAllArticles: vi.fn(),
    getLatestArticles: vi.fn(),
}));

function summary(slug: string, overrides: Partial<ArticleSummary> = {}) {
    return {
        slug,
        title: `Title ${slug}`,
        description: `Description ${slug}.`,
        date: '2026-08-01',
        tags: ['Git'],
        cover: `/images/articles/${slug}.svg`,
        coverColors: ['#111111', '#222222'],
        readingMinutes: 5,
        ...overrides,
    } satisfies ArticleSummary;
}

describe('ArticlesArea', () => {
    beforeEach(() => {
        vi.mocked(getLatestArticles).mockReset();
        vi.mocked(getAllArticles).mockReset();
    });

    it('renders nothing when there are no articles', () => {
        vi.mocked(getLatestArticles).mockReturnValue([]);
        vi.mocked(getAllArticles).mockReturnValue([]);

        const { container } = render(<ArticlesArea />);

        expect(container).toBeEmptyDOMElement();
    });

    it('asks for the three newest articles and lists them in order', () => {
        const latest = ['alpha', 'bravo', 'charlie'].map((slug) =>
            summary(slug)
        );
        vi.mocked(getLatestArticles).mockReturnValue(latest);
        vi.mocked(getAllArticles).mockReturnValue(latest);

        render(<ArticlesArea />);

        expect(getLatestArticles).toHaveBeenCalledWith(3);
        expect(
            screen
                .getAllByRole('heading', { level: 3 })
                .map((heading) => heading.textContent)
        ).toEqual(['Title alpha', 'Title bravo', 'Title charlie']);
    });

    it('counts series parts across every article, not just the teased ones', () => {
        const teased = summary('part-two', {
            series: { name: 'Homelab', order: 2 },
        });
        vi.mocked(getLatestArticles).mockReturnValue([teased]);
        vi.mocked(getAllArticles).mockReturnValue([
            teased,
            summary('part-one', { series: { name: 'Homelab', order: 1 } }),
            summary('part-three', { series: { name: 'Homelab', order: 3 } }),
        ]);

        render(<ArticlesArea />);

        expect(screen.getByText('Part 2 of 3')).toBeInTheDocument();
    });

    it('links to every article under the list', () => {
        const latest = [summary('alpha')];
        vi.mocked(getLatestArticles).mockReturnValue(latest);
        vi.mocked(getAllArticles).mockReturnValue(latest);

        render(<ArticlesArea />);

        const section = screen
            .getByRole('heading', { name: 'Latest Articles' })
            .closest('section') as HTMLElement;
        const viewAll = within(section).getByRole('link', {
            name: 'View all articles',
        });
        expect(viewAll).toHaveAttribute('href', '/articles');
        expect(viewAll).toHaveClass('border', 'rounded-full');
    });
});
