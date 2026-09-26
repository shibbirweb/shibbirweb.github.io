import { describe, expect, it } from 'vitest';
import {
    BINARY_FIELD_COLS,
    BINARY_FIELD_ROWS,
    FIELD_CHARACTERS,
    generateBinaryField,
} from '@/components/layout/Footer/SignatureSpotlight/binaryField';

describe('generateBinaryField', () => {
    const field = generateBinaryField();
    const rows = field.split('\n');

    it('is identical on every call so server and client renders match', () => {
        expect(generateBinaryField()).toBe(field);
    });

    it('has the default number of rows and columns', () => {
        expect(rows).toHaveLength(BINARY_FIELD_ROWS);
        for (const row of rows) {
            expect(row).toHaveLength(BINARY_FIELD_COLS);
        }
    });

    it('draws only from the field characters', () => {
        const allowed = new Set(FIELD_CHARACTERS);
        for (const character of field.replace(/\n/g, '')) {
            expect(allowed.has(character)).toBe(true);
        }
    });

    it('uses every field character, so it is not a flat fill', () => {
        for (const character of FIELD_CHARACTERS) {
            expect(field).toContain(character);
        }
    });

    it('does not end with a trailing newline', () => {
        expect(field.endsWith('\n')).toBe(false);
    });

    it('honours custom dimensions', () => {
        const small = generateBinaryField(3, 7);
        expect(small.split('\n')).toHaveLength(3);
        expect(small.split('\n').every((row) => row.length === 7)).toBe(true);
    });

    it('is reproducible per seed and differs between seeds', () => {
        expect(generateBinaryField(4, 40, 123)).toBe(
            generateBinaryField(4, 40, 123)
        );
        expect(generateBinaryField(4, 40, 123)).not.toBe(
            generateBinaryField(4, 40, 456)
        );
    });

    it('does not depend on Math.random', () => {
        const originalRandom = Math.random;
        Math.random = () => 0;
        try {
            expect(generateBinaryField()).toBe(field);
        } finally {
            Math.random = originalRandom;
        }
    });
});
