import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesLink from '@/components/pages/articles/ArticlesBrowse/SeriesLink';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

const series: SeriesShelfEntry = {
    name: 'Local Webhooks',
    parts: [
        { slug: 'part-one', title: 'Part one', cover: '/one.svg' },
        { slug: 'part-two', title: 'Part two', cover: '/two.svg' },
    ],
    readingMinutes: 16,
    accentColors: ['#111111', '#222222'],
    latestDate: '2026-11-16',
    tags: [],
    tech: [],
};

describe('SeriesLink', () => {
    it('opens the first part and says how many parts there are', () => {
        render(<SeriesLink series={series} />);

        const link = screen.getByRole('link', {
            name: 'Local Webhooks, 2 parts, start with part 1',
        });
        expect(link).toHaveAttribute('href', '/articles/part-one');
        expect(link.style.getPropertyValue('--accent-from')).toBe('#111111');
    });

    it('uses the singular for a one-part series', () => {
        render(<SeriesLink series={{ ...series, parts: [series.parts[0]] }} />);

        expect(screen.getByText('1 part')).toBeInTheDocument();
    });
});
