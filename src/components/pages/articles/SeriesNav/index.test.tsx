import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesNav from '@/components/pages/articles/SeriesNav';
import type { ArticleSeries } from '@/lib/posts';

const series: ArticleSeries = {
    name: 'Home lab from scratch',
    parts: [
        {
            slug: 'home-lab-1',
            title: 'Picking hardware',
            order: 1,
            isCurrent: false,
        },
        {
            slug: 'home-lab-2',
            title: 'Installing Proxmox',
            order: 2,
            isCurrent: true,
        },
        {
            slug: 'home-lab-3',
            title: 'Backups that work',
            order: 3,
            isCurrent: false,
        },
    ],
};

function renderSeriesNav() {
    return render(
        <SeriesNav
            series={series}
            currentSlug="home-lab-2"
            accentColors={['#111111', '#222222']}
        />
    );
}

describe('SeriesNav', () => {
    it('names the series in a labelled region', () => {
        renderSeriesNav();

        const region = screen.getByRole('region', {
            name: 'Series: Home lab from scratch',
        });
        expect(
            within(region).getByRole('heading', {
                level: 2,
                name: 'Home lab from scratch',
            })
        ).toBeInTheDocument();
    });

    it('shows the current position as "Part N of M"', () => {
        renderSeriesNav();

        expect(screen.getByText('Part 2 of 3')).toBeInTheDocument();
    });

    it('links every other part and marks the current one without a link', () => {
        renderSeriesNav();

        expect(
            screen.getByRole('link', { name: /Picking hardware/ })
        ).toHaveAttribute('href', '/articles/home-lab-1');
        expect(
            screen.getByRole('link', { name: /Backups that work/ })
        ).toHaveAttribute('href', '/articles/home-lab-3');
        expect(
            screen.queryByRole('link', { name: /Installing Proxmox/ })
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('Installing Proxmox').parentElement
        ).toHaveAttribute('aria-current', 'page');
    });

    it('lists the parts in reading order with step numbers', () => {
        renderSeriesNav();

        const steps = screen.getAllByRole('listitem');
        expect(steps.map((step) => step.textContent)).toEqual([
            '1Picking hardware',
            '2Installing Proxmox',
            '3Backups that work',
        ]);
    });
});
