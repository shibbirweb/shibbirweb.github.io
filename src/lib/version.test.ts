import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBuiltAt } from '@/lib/version';

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('getBuiltAt', () => {
    it('returns the baked NEXT_PUBLIC_BUILD_TIME stamp', () => {
        vi.stubEnv('NEXT_PUBLIC_BUILD_TIME', '2026-09-26T08:00:00.000Z');

        expect(getBuiltAt()).toBe('2026-09-26T08:00:00.000Z');
    });

    it('falls back to the epoch when the build time is unset', () => {
        vi.stubEnv('NEXT_PUBLIC_BUILD_TIME', undefined);

        expect(getBuiltAt()).toBe('1970-01-01T00:00:00.000Z');
    });
});
