import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesMeta from '@/components/pages/articles/SeriesIndex/SeriesMeta';
import { buildSeriesEntry } from '@tests/helpers/seriesEntry';

describe('SeriesMeta', () => {
    it('reads the part count, reading time and last update', () => {
        const { container } = render(
            <SeriesMeta series={buildSeriesEntry()} />
        );

        expect(container).toHaveTextContent(
            '2 parts · 16 min read · Updated Nov 16, 2026'
        );
        expect(container.querySelector('time')).toHaveAttribute(
            'datetime',
            '2026-11-16'
        );
    });

    it('uses the singular for a single part', () => {
        const entry = buildSeriesEntry();
        const { container } = render(
            <SeriesMeta series={{ ...entry, parts: [entry.parts[0]] }} />
        );

        expect(container).toHaveTextContent(/^1 part ·/);
    });
});
