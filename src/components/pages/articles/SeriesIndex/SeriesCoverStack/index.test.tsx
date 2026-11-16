import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesCoverStack, {
    STACKED_COVER_LIMIT,
} from '@/components/pages/articles/SeriesIndex/SeriesCoverStack';
import { buildSeriesEntry } from '@tests/helpers/seriesEntry';

const fourParts = Array.from({ length: 4 }, (_, index) => ({
    slug: `part-${index + 1}`,
    title: `Part ${index + 1}`,
    cover: `/images/articles/part-${index + 1}.svg`,
}));

describe('SeriesCoverStack', () => {
    it('stacks part 1 in front, each later cover one layer deeper', () => {
        const { container } = render(
            <SeriesCoverStack parts={buildSeriesEntry().parts} />
        );

        const covers = [...container.querySelectorAll('img')];
        expect(covers.map((cover) => cover.getAttribute('src'))).toEqual([
            expect.stringContaining('mailgun-webhooks'),
            expect.stringContaining('twilio-webhooks'),
        ]);
        expect(
            covers.map((cover) => cover.style.getPropertyValue('--depth'))
        ).toEqual(['0', '1']);
    });

    it(`shows at most ${STACKED_COVER_LIMIT} covers`, () => {
        const { container } = render(<SeriesCoverStack parts={fourParts} />);

        expect(container.querySelectorAll('img')).toHaveLength(
            STACKED_COVER_LIMIT
        );
    });

    it('is decorative, since the parts are listed in text', () => {
        const { container } = render(<SeriesCoverStack parts={fourParts} />);

        expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('loads only the front cover eagerly when asked', () => {
        const { container } = render(
            <SeriesCoverStack
                parts={fourParts}
                eager
            />
        );

        expect(
            [...container.querySelectorAll('img')].map((cover) =>
                cover.getAttribute('loading')
            )
        ).toEqual(['eager', 'lazy', 'lazy']);
    });
});
