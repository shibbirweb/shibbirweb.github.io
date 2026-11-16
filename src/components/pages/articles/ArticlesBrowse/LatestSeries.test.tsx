import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LatestSeries from '@/components/pages/articles/ArticlesBrowse/LatestSeries';
import type { SeriesShelfEntry } from '@/utils/seriesShelf';

const series: SeriesShelfEntry = {
    name: 'Local Webhooks',
    parts: [{ slug: 'part-one', title: 'Part one', cover: '/one.svg' }],
    readingMinutes: 8,
    accentColors: ['#111111', '#222222'],
    latestDate: '2026-11-16',
    tags: [],
    tech: [],
};

describe('LatestSeries', () => {
    it('labels the latest series and links to every series', () => {
        render(
            <LatestSeries
                series={series}
                seriesCount={3}
            />
        );

        expect(
            screen.getByRole('heading', { level: 2, name: 'Latest series' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /Local Webhooks/ })
        ).toHaveAttribute('href', '/articles/part-one');
        expect(
            screen.getByRole('link', { name: 'All series (3)' })
        ).toHaveAttribute('href', '/articles/series');
    });
});
