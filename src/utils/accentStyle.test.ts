import { describe, expect, it } from 'vitest';
import { accentStyle } from '@/utils/accentStyle';

describe('accentStyle', () => {
    it('exposes the two cover colours as --accent-from and --accent-to', () => {
        expect(accentStyle(['#4f46e5', '#7c3aed'])).toEqual({
            '--accent-from': '#4f46e5',
            '--accent-to': '#7c3aed',
        });
    });

    it('keeps the colour order so the gradient direction is preserved', () => {
        const style = accentStyle(['red', 'blue']) as Record<string, string>;
        expect(style['--accent-from']).toBe('red');
        expect(style['--accent-to']).toBe('blue');
    });
});
