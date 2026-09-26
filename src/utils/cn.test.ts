import { describe, expect, it } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn', () => {
    it('joins truthy class names and skips falsy ones', () => {
        expect(cn('a', false, null, undefined, 'b')).toBe('a b');
    });

    it('lets a later Tailwind utility override a conflicting earlier one', () => {
        expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
    });

    it('accepts clsx object and array syntax', () => {
        expect(cn(['a', { b: true, c: false }])).toBe('a b');
    });
});
