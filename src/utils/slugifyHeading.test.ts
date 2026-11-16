import { describe, expect, it } from 'vitest';
import { slugifyHeading } from '@/utils/slugifyHeading';

describe('slugifyHeading', () => {
    it('lowercases and joins words with single hyphens', () => {
        expect(slugifyHeading('Cache-aside Pattern')).toBe(
            'cache-aside-pattern'
        );
    });

    it('collapses runs of punctuation and trims leading/trailing hyphens', () => {
        expect(slugifyHeading('  What is `firstOrCreate()`?!  ')).toBe(
            'what-is-firstorcreate'
        );
    });

    it('returns an empty string when nothing slug-worthy remains', () => {
        expect(slugifyHeading('!!!')).toBe('');
    });
});
