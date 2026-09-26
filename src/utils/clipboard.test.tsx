import { afterEach, describe, expect, it, vi } from 'vitest';
import { writeToClipboard } from '@/utils/clipboard';

const originalClipboard = Object.getOwnPropertyDescriptor(
    window.navigator,
    'clipboard'
);

function setClipboard(value: unknown) {
    Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value,
    });
}

afterEach(() => {
    if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
    } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
    }
    Reflect.deleteProperty(document, 'execCommand');
    vi.restoreAllMocks();
});

describe('writeToClipboard', () => {
    it('uses the async Clipboard API when available', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        setClipboard({ writeText });
        const execCommand = vi.fn();
        document.execCommand = execCommand;

        await writeToClipboard('https://shibbir.me/articles/x');

        expect(writeText).toHaveBeenCalledWith('https://shibbir.me/articles/x');
        expect(execCommand).not.toHaveBeenCalled();
    });

    it('propagates a Clipboard API rejection to the caller', async () => {
        setClipboard({
            writeText: vi.fn().mockRejectedValue(new Error('denied')),
        });
        await expect(writeToClipboard('text')).rejects.toThrow('denied');
    });

    it('falls back to a hidden textarea and execCommand without the API', async () => {
        setClipboard(undefined);
        let copiedValue: string | null = null;
        let wasSelected = false;
        document.execCommand = vi.fn((command: string) => {
            const textarea = document.querySelector('textarea');
            copiedValue = textarea?.value ?? null;
            wasSelected =
                textarea !== null &&
                textarea.selectionStart === 0 &&
                textarea.selectionEnd === textarea.value.length;
            return command === 'copy';
        });

        await writeToClipboard('fallback text');

        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(copiedValue).toBe('fallback text');
        expect(wasSelected).toBe(true);
    });

    it('keeps the fallback textarea off-screen, read-only, and removes it afterwards', async () => {
        setClipboard({});
        let textareaSnapshot: HTMLTextAreaElement | null = null;
        document.execCommand = vi.fn(() => {
            textareaSnapshot = document.querySelector('textarea');
            return true;
        });

        await writeToClipboard('temporary');

        expect(textareaSnapshot).not.toBeNull();
        const textarea = textareaSnapshot as unknown as HTMLTextAreaElement;
        expect(textarea.hasAttribute('readonly')).toBe(true);
        expect(textarea.style.position).toBe('fixed');
        expect(textarea.style.top).toBe('-9999px');
        expect(document.querySelector('textarea')).toBeNull();
    });
});
