import { describe, expect, it } from 'vitest';
import {
    parseArticleDate,
    requireArticleDate,
    toDateString,
} from '@/utils/articleDate';

describe('toDateString', () => {
    it('passes a YYYY-MM-DD string through unchanged', () => {
        expect(toDateString('2026-08-01')).toBe('2026-08-01');
    });

    it('coerces an unquoted YAML date (a Date object) back to YYYY-MM-DD', () => {
        expect(toDateString(new Date('2026-08-01T00:00:00Z'))).toBe(
            '2026-08-01'
        );
    });

    it('returns an empty string for null or undefined', () => {
        expect(toDateString(null)).toBe('');
        expect(toDateString(undefined)).toBe('');
    });

    it('stringifies any other value', () => {
        expect(toDateString(2026)).toBe('2026');
    });
});

describe('parseArticleDate', () => {
    it('parses a date as UTC midnight regardless of the host time zone', () => {
        const parsed = parseArticleDate('2026-08-01');
        expect(parsed?.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    });

    it('returns null for an empty value', () => {
        expect(parseArticleDate('')).toBeNull();
    });

    it('returns null for a malformed value', () => {
        expect(parseArticleDate('not-a-date')).toBeNull();
        expect(parseArticleDate('2026-13-45')).toBeNull();
    });
});

describe('requireArticleDate', () => {
    it('returns the UTC-midnight Date for a valid value', () => {
        expect(requireArticleDate('2026-07-10').toISOString()).toBe(
            '2026-07-10T00:00:00.000Z'
        );
    });

    it('throws a RangeError naming the bad value', () => {
        expect(() => requireArticleDate('yesterday')).toThrow(RangeError);
        expect(() => requireArticleDate('yesterday')).toThrow('"yesterday"');
    });
});
