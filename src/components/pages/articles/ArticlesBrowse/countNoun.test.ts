import { describe, expect, it } from 'vitest';
import {
    articleNoun,
    formatCount,
    seriesNoun,
} from '@/components/pages/articles/ArticlesBrowse/countNoun';

describe('formatCount', () => {
    it.each([
        [1, articleNoun, '1 article'],
        [3, articleNoun, '3 articles'],
        [0, articleNoun, '0 articles'],
        [1, seriesNoun, '1 series'],
        [2, seriesNoun, '2 series'],
    ])('formats %i with its noun', (count, noun, expected) => {
        expect(formatCount(count, noun)).toBe(expected);
    });
});
