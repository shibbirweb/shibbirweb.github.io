import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StartSeriesLink from '@/components/pages/articles/SeriesIndex/StartSeriesLink';

describe('StartSeriesLink', () => {
    it('opens part 1, naming the series for screen readers', () => {
        render(
            <StartSeriesLink
                firstPartSlug="mailgun-webhooks"
                seriesName="Local Webhooks"
            />
        );

        expect(
            screen.getByRole('link', {
                name: 'Start with part 1 of Local Webhooks',
            })
        ).toHaveAttribute('href', '/articles/mailgun-webhooks');
    });
});
