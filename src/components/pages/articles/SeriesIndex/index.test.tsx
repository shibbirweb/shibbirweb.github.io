import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SeriesIndex from '@/components/pages/articles/SeriesIndex';
import { buildSeriesEntry } from '@tests/helpers/seriesEntry';

const navigation = vi.hoisted(() => ({
    searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
    usePathname: () => '/articles/series',
    useSearchParams: () => navigation.searchParams,
}));

describe('SeriesIndex', () => {
    it('keeps the heading and intro for screen readers, but not on screen', () => {
        render(<SeriesIndex series={[buildSeriesEntry()]} />);

        expect(
            screen.getByRole('heading', { level: 1, name: 'Series' })
        ).toHaveClass('sr-only');
        expect(
            screen.getByText(
                'Multi-part guides, meant to be read in order. Each one starts at part 1.'
            )
        ).toHaveClass('sr-only');
        expect(
            screen.getByRole('navigation', { name: 'Breadcrumb' })
        ).toBeInTheDocument();
    });

    it('filters by the ?tag= in the address', () => {
        navigation.searchParams = new URLSearchParams('tag=Rust');

        render(<SeriesIndex series={[buildSeriesEntry()]} />);

        expect(
            screen.getByText('No series found for this topic.')
        ).toBeInTheDocument();
        navigation.searchParams = new URLSearchParams();
    });
});
