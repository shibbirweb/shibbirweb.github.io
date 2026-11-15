import { describe, expect, it } from 'vitest';
import { seriesPartLabel } from '@/components/pages/articles/ArticleRow/seriesPartLabel';

const series = { name: 'Homelab notes', order: 2 };

describe('seriesPartLabel', () => {
    it('is undefined for a standalone article', () => {
        expect(seriesPartLabel(undefined, 3)).toBeUndefined();
    });

    it('reads "Part N of M" when the published total is known', () => {
        expect(seriesPartLabel(series, 3)).toBe('Part 2 of 3');
    });

    it.each([undefined, 0, 1])(
        'falls back to "Part N" when the total is %j',
        (total) => {
            expect(seriesPartLabel(series, total)).toBe('Part 2');
        }
    );
});
