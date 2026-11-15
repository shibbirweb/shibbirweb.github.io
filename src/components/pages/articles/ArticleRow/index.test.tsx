import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleRow from '@/components/pages/articles/ArticleRow';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
    return {
        slug: 'pi-hole-without-pinning',
        title: 'Using Pi-hole Without Pinning',
        description: 'Ad blocking I can switch on per device.',
        date: '2026-08-01',
        tags: ['Pi-hole', 'WireGuard', 'Proxmox', 'DNS'],
        cover: '/images/articles/pi-hole.svg',
        coverColors: ['#6366f1', '#8b5cf6'],
        readingMinutes: 24,
        category: 'Homelab',
        ...overrides,
    };
}

function renderRow(article = buildArticle(), seriesTotal?: number) {
    return render(
        <ul>
            <ArticleRow
                article={article}
                seriesTotal={seriesTotal}
            />
        </ul>
    );
}

function getRow() {
    return screen.getByRole('heading', { level: 3 }).closest('li');
}

describe('ArticleRow', () => {
    it('links the row to the article page by slug', () => {
        renderRow();

        expect(
            screen.getByRole('link', { name: /Using Pi-hole Without Pinning/ })
        ).toHaveAttribute('href', '/articles/pi-hole-without-pinning');
    });

    it('shows the title, description, category and reading time', () => {
        renderRow();

        expect(
            screen.getByRole('heading', {
                level: 3,
                name: 'Using Pi-hole Without Pinning',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Ad blocking I can switch on per device.')
        ).toHaveClass('line-clamp-2');
        expect(screen.getByText('Homelab')).toBeInTheDocument();
        expect(screen.getByText('24 min read')).toBeInTheDocument();
    });

    it('falls back to the first tag when the article has no category', () => {
        renderRow(buildArticle({ category: undefined }));

        expect(getRow()?.querySelector('p')).toHaveTextContent(/^Pi-hole/);
    });

    it('shows the series part for a series article', () => {
        renderRow(buildArticle({ series: { name: 'Homelab', order: 2 } }), 3);

        expect(screen.getByText('Part 2 of 3')).toBeInTheDocument();
    });

    it('dates the row with its calendar tile', () => {
        renderRow();

        expect(getRow()?.querySelector('time')).toHaveAttribute(
            'datetime',
            '2026-08-01'
        );
    });

    it('carries its cover colours for the tile and the glow', () => {
        renderRow();

        expect(getRow()?.style.getPropertyValue('--cover-from')).toBe(
            '#6366f1'
        );
        expect(getRow()?.style.getPropertyValue('--cover-to')).toBe('#8b5cf6');
    });

    it('marks itself as a spotlight surface', () => {
        renderRow();

        expect(getRow()).toHaveAttribute('data-spotlight-surface', 'true');
    });

    it('does not ship the cover image', () => {
        renderRow();

        expect(getRow()?.querySelector('img')).toBeNull();
    });
});
