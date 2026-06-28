'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

async function writeToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    // Fallback for non-secure contexts where the async Clipboard API is absent.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

/**
 * Copies text to the clipboard and exposes a transient `copied` flag that flips
 * back to false after `resetDelayMs`, for showing a brief confirmation. Falls
 * back to a hidden textarea when the async Clipboard API is unavailable.
 */
export function useCopyToClipboard(
    resetDelayMs = 2000
): readonly [boolean, (text: string) => void] {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copy = useCallback(
        (text: string) => {
            void (async () => {
                try {
                    await writeToClipboard(text);
                    setCopied(true);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    timeoutRef.current = setTimeout(
                        () => setCopied(false),
                        resetDelayMs
                    );
                } catch {
                    // Copy was blocked or unsupported; leave the button as-is.
                }
            })();
        },
        [resetDelayMs]
    );

    useEffect(
        () => () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        },
        []
    );

    return [copied, copy] as const;
}
