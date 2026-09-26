import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsMac } from '@/components/pages/articles/ArticleSearch/hooks/useIsMac';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useIsMac', () => {
    it.each(['MacIntel', 'iPhone', 'iPad'])(
        'is true on an Apple platform (%s)',
        (platform) => {
            vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);

            const { result } = renderHook(() => useIsMac());

            expect(result.current).toBe(true);
        }
    );

    it.each(['Win32', 'Linux x86_64'])(
        'is false elsewhere (%s)',
        (platform) => {
            vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);

            const { result } = renderHook(() => useIsMac());

            expect(result.current).toBe(false);
        }
    );

    it('falls back to the user agent when the platform is empty', () => {
        vi.spyOn(navigator, 'platform', 'get').mockReturnValue('');
        vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)'
        );

        const { result } = renderHook(() => useIsMac());

        expect(result.current).toBe(true);
    });
});
