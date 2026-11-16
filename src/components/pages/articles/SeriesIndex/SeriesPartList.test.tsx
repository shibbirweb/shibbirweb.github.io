import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesPartList from '@/components/pages/articles/SeriesIndex/SeriesPartList';
import { buildSeriesEntry } from '@tests/helpers/seriesEntry';

describe('SeriesPartList', () => {
    it('lists every part in order, each linking to its article', () => {
        render(<SeriesPartList parts={buildSeriesEntry().parts} />);

        const links = screen.getAllByRole('link');
        expect(links.map((link) => link.getAttribute('href'))).toEqual([
            '/articles/mailgun-webhooks',
            '/articles/twilio-webhooks',
        ]);
        expect(links[0]).toHaveAccessibleName('Part 1: Mailgun webhooks');
    });
});
