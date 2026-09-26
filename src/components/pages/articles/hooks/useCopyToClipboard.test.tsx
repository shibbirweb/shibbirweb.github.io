import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCopyToClipboard } from '@/components/pages/articles/hooks/useCopyToClipboard';

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

/** Runs copy and lets the awaited clipboard write settle. */
async function copyText(
    copy: (text: string) => void,
    text: string
): Promise<void> {
    await act(async () => {
        copy(text);
        await Promise.resolve();
    });
}

describe('useCopyToClipboard', () => {
    it('starts not copied', () => {
        const { result } = renderHook(() => useCopyToClipboard());

        expect(result.current[0]).toBe(false);
    });

    it('writes the text and flips copied on', async () => {
        const { result } = renderHook(() => useCopyToClipboard());

        await copyText(result.current[1], 'npm run build');

        expect(writeText).toHaveBeenCalledWith('npm run build');
        expect(result.current[0]).toBe(true);
    });

    it('resets copied after two seconds by default', async () => {
        const { result } = renderHook(() => useCopyToClipboard());
        await copyText(result.current[1], 'text');

        act(() => {
            vi.advanceTimersByTime(1999);
        });
        expect(result.current[0]).toBe(true);

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current[0]).toBe(false);
    });

    it('honours a custom reset delay', async () => {
        const { result } = renderHook(() => useCopyToClipboard(500));
        await copyText(result.current[1], 'text');

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current[0]).toBe(false);
    });

    it('restarts the reset window when copying again', async () => {
        const { result } = renderHook(() => useCopyToClipboard());
        await copyText(result.current[1], 'first');
        act(() => {
            vi.advanceTimersByTime(1500);
        });

        await copyText(result.current[1], 'second');
        act(() => {
            vi.advanceTimersByTime(1500);
        });
        expect(result.current[0]).toBe(true);

        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current[0]).toBe(false);
    });

    it('stays not copied when the clipboard write is rejected', async () => {
        writeText.mockRejectedValue(new Error('Blocked'));
        const { result } = renderHook(() => useCopyToClipboard());

        await copyText(result.current[1], 'text');

        expect(result.current[0]).toBe(false);
    });

    it('clears the pending reset on unmount', async () => {
        const { result, unmount } = renderHook(() => useCopyToClipboard());
        await copyText(result.current[1], 'text');

        unmount();

        expect(vi.getTimerCount()).toBe(0);
    });
});
