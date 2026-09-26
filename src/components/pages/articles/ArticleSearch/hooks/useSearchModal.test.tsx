import { act, fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSearchModal } from '@/components/pages/articles/ArticleSearch/hooks/useSearchModal';

describe('useSearchModal', () => {
    it('starts closed', () => {
        const { result } = renderHook(() => useSearchModal());

        expect(result.current.open).toBe(false);
    });

    it('opens with show and closes with close', () => {
        const { result } = renderHook(() => useSearchModal());

        act(() => {
            result.current.show();
        });
        expect(result.current.open).toBe(true);

        act(() => {
            result.current.close();
        });
        expect(result.current.open).toBe(false);
    });

    it('opens on Cmd+K and prevents the browser default', () => {
        const { result } = renderHook(() => useSearchModal());

        let notCancelled = true;
        act(() => {
            notCancelled = fireEvent.keyDown(window, {
                key: 'k',
                metaKey: true,
            });
        });

        expect(result.current.open).toBe(true);
        expect(notCancelled).toBe(false);
    });

    it('opens on Ctrl+K, including with Caps Lock (upper-case K)', () => {
        const { result } = renderHook(() => useSearchModal());

        act(() => {
            fireEvent.keyDown(window, { key: 'K', ctrlKey: true });
        });

        expect(result.current.open).toBe(true);
    });

    it('ignores K without a modifier and other modified keys', () => {
        const { result } = renderHook(() => useSearchModal());

        act(() => {
            fireEvent.keyDown(window, { key: 'k' });
            fireEvent.keyDown(window, { key: 'j', metaKey: true });
        });

        expect(result.current.open).toBe(false);
    });

    it('stops listening once unmounted', () => {
        const { result, unmount } = renderHook(() => useSearchModal());
        unmount();

        const notCancelled = fireEvent.keyDown(window, {
            key: 'k',
            metaKey: true,
        });

        expect(notCancelled).toBe(true);
        expect(result.current.open).toBe(false);
    });
});
