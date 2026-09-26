import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUnsavedChangesWarning } from '@/components/pages/article-editor/ArticleEditor/hooks/useUnsavedChangesWarning';

function fireBeforeUnload(): Event {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useUnsavedChangesWarning', () => {
    it('does not prompt while there are no unsaved edits', () => {
        const addListener = vi.spyOn(window, 'addEventListener');
        renderHook(() => useUnsavedChangesWarning(false));

        expect(fireBeforeUnload().defaultPrevented).toBe(false);
        expect(
            addListener.mock.calls.some(
                ([type]) => (type as string) === 'beforeunload'
            )
        ).toBe(false);
    });

    it('asks the browser to confirm unloading while dirty', () => {
        renderHook(() => useUnsavedChangesWarning(true));

        expect(fireBeforeUnload().defaultPrevented).toBe(true);
    });

    it('stops prompting once the edits are saved', () => {
        const { rerender } = renderHook(
            ({ isDirty }) => useUnsavedChangesWarning(isDirty),
            { initialProps: { isDirty: true } }
        );

        rerender({ isDirty: false });

        expect(fireBeforeUnload().defaultPrevented).toBe(false);
    });

    it('removes the listener on unmount', () => {
        const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

        unmount();

        expect(fireBeforeUnload().defaultPrevented).toBe(false);
    });
});
