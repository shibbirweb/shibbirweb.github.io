import { renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCloseOnRouteChange } from '@/components/layout/Navbar/hooks/useCloseOnRouteChange';

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);

describe('useCloseOnRouteChange', () => {
    beforeEach(() => {
        mockedUsePathname.mockReturnValue('/');
    });

    it('closes once on mount', () => {
        const onClose = vi.fn();
        renderHook(() => useCloseOnRouteChange(onClose));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes again when the pathname changes', () => {
        const onClose = vi.fn();
        const { rerender } = renderHook(() => useCloseOnRouteChange(onClose));

        mockedUsePathname.mockReturnValue('/uses');
        rerender();

        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('does not close on a re-render at the same pathname', () => {
        const onClose = vi.fn();
        const { rerender } = renderHook(() => useCloseOnRouteChange(onClose));

        rerender();
        rerender();

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
