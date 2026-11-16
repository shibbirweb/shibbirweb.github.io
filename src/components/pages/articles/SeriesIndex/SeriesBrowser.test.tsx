import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesBrowser from '@/components/pages/articles/SeriesIndex/SeriesBrowser';
import { buildSeriesEntry } from '@tests/helpers/seriesEntry';

const webhooks = buildSeriesEntry();
const homelab = buildSeriesEntry({
    name: 'Home lab',
    tags: ['DNS'],
    parts: [{ slug: 'dns', title: 'DNS', cover: '/images/articles/dns.svg' }],
});

function seriesHeadings() {
    return screen
        .queryAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent);
}

describe('SeriesBrowser', () => {
    it('ships every series as a card and as a row, for CSS to pick one', () => {
        render(
            <SeriesBrowser
                series={[webhooks, homelab]}
                activeTag={null}
            />
        );

        const lists = document.querySelectorAll('main ul, ul');
        expect(
            [...lists].some((list) => list.className.includes('gridView'))
        ).toBe(true);
        expect(
            [...lists].some((list) => list.className.includes('listView'))
        ).toBe(true);
        expect(seriesHeadings()).toEqual([
            'Local Webhooks',
            'Home lab',
            'Local Webhooks',
            'Home lab',
        ]);
    });

    it('counts the series and offers Filters and the layout toggle', () => {
        render(
            <SeriesBrowser
                series={[webhooks, homelab]}
                activeTag={null}
            />
        );

        expect(screen.getByText('2 series')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Filters' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('group', { name: 'Layout' })
        ).toBeInTheDocument();
    });

    it('keeps only the series that cover the applied topic', () => {
        render(
            <SeriesBrowser
                series={[webhooks, homelab]}
                activeTag="DNS"
            />
        );

        expect(seriesHeadings()).toEqual(['Home lab', 'Home lab']);
        expect(screen.getByText('1 series')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'All (2 series)' })
        ).toHaveAttribute('href', '/articles/series');
    });

    it('says so when no series covers the topic', () => {
        render(
            <SeriesBrowser
                series={[webhooks]}
                activeTag="Rust"
            />
        );

        expect(
            screen.getByText('No series found for this topic.')
        ).toBeInTheDocument();
        expect(seriesHeadings()).toEqual([]);
    });
});
