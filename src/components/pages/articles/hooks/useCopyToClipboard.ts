'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { writeToClipboard } from '@/utils/clipboard';

/**
 * Copies text to the clipboard and exposes a transient `copied` flag that flips
 * back to false after `resetDelayMs`, for showing a brief confirmation. Shared
 * by the Mermaid and code-block copy buttons.
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
