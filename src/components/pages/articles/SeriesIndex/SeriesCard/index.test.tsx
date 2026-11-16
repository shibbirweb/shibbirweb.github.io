import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesCard from '@/components/pages/articles/SeriesIndex/SeriesCard';
import { buildSeriesEntry } from '@tests/helpers/seriesEntry';

function renderCard() {
    return render(
        <ul>
            <SeriesCard series={buildSeriesEntry()} />
        </ul>
    );
}

describe('SeriesCard', () => {
    it('names the series as a heading with its meta line', () => {
        renderCard();

        expect(
            screen.getByRole('heading', { level: 2, name: 'Local Webhooks' })
        ).toBeInTheDocument();
        expect(screen.getByText(/2 parts · 16 min read/)).toBeInTheDocument();
    });

    it('lists the parts and offers a way in at part 1', () => {
        renderCard();

        expect(
            screen.getByRole('link', { name: /Part 2: Twilio webhooks/ })
        ).toHaveAttribute('href', '/articles/twilio-webhooks');
        expect(
            screen.getByRole('link', {
                name: 'Start with part 1 of Local Webhooks',
            })
        ).toHaveAttribute('href', '/articles/mailgun-webhooks');
    });

    it('shows the tags that filter the series page and the stack', () => {
        renderCard();

        expect(screen.getByRole('link', { name: 'SendMock' })).toHaveAttribute(
            'href',
            '/articles/series?tag=SendMock'
        );
        expect(screen.getByText('Stack')).toBeInTheDocument();
        expect(screen.getByText('PHP')).toBeInTheDocument();
    });

    it('is a spotlight surface tinted with the series accent', () => {
        renderCard();

        const surface = screen.getAllByRole('listitem')[0];
        expect(surface).toHaveAttribute('data-spotlight-surface');
        expect(surface.style.getPropertyValue('--accent-to')).toBe('#222222');
    });
});
