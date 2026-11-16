import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesTags from '@/components/pages/articles/SeriesIndex/SeriesTags';

describe('SeriesTags', () => {
    it('links each tag to the series page filtered by it', () => {
        render(<SeriesTags tags={['Laravel', 'C# & .NET']} />);

        expect(
            screen.getByRole('list', { name: 'Topics' })
        ).toBeInTheDocument();
        expect(
            screen.getAllByRole('link').map((link) => link.getAttribute('href'))
        ).toEqual([
            '/articles/series?tag=Laravel',
            '/articles/series?tag=C%23%20%26%20.NET',
        ]);
    });

    it('renders nothing without tags', () => {
        const { container } = render(<SeriesTags tags={[]} />);

        expect(container).toBeEmptyDOMElement();
    });
});
