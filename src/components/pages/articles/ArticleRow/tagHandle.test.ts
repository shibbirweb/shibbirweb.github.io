import { describe, expect, it } from 'vitest';
import { tagHandle } from '@/components/pages/articles/ArticleRow/tagHandle';

describe('tagHandle', () => {
    it('lower-cases a single word tag behind a hash', () => {
        expect(tagHandle('Laravel')).toBe('#laravel');
    });

    it('joins the words of a multi-word tag with hyphens', () => {
        expect(tagHandle('Database Collation')).toBe('#database-collation');
    });

    it('collapses runs of whitespace and trims the ends', () => {
        expect(tagHandle('  Version   Control ')).toBe('#version-control');
    });

    it('keeps punctuation that is part of the tag', () => {
        expect(tagHandle('Next.js')).toBe('#next.js');
        expect(tagHandle('Pi-hole')).toBe('#pi-hole');
    });
});
