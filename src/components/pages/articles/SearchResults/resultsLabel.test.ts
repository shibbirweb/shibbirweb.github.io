import { describe, expect, it } from 'vitest';
import { resolveResultsLabel } from '@/components/pages/articles/SearchResults/resultsLabel';

describe('resolveResultsLabel', () => {
    it('says no articles were found for zero results', () => {
        expect(resolveResultsLabel(0)).toBe('No articles found for ');
    });

    it('uses the singular noun for exactly one result', () => {
        expect(resolveResultsLabel(1)).toBe('1 article found for ');
    });

    it('uses the plural noun and the count for several results', () => {
        expect(resolveResultsLabel(2)).toBe('2 articles found for ');
        expect(resolveResultsLabel(12)).toBe('12 articles found for ');
    });

    it('ends with a space so the quoted query follows cleanly', () => {
        for (const count of [0, 1, 5]) {
            expect(resolveResultsLabel(count).endsWith(' ')).toBe(true);
        }
    });
});
