'use client';

import { useEffect, useState } from 'react';

export interface CodeCopySlot {
    slot: HTMLElement;
    code: string;
    key: string;
}

/**
 * Finds the copy-button slots that `posts.ts` emits in each code block header
 * and reads that block's source from its `<pre><code>`, so a button can be
 * portaled in.
 */
export function useCodeCopySlots(): CodeCopySlot[] {
    const [slots, setSlots] = useState<CodeCopySlot[]>([]);

    useEffect(() => {
        const elements = Array.from(
            document.querySelectorAll<HTMLElement>('[data-code-copy]')
        );
        if (elements.length === 0) return;

        setSlots(
            elements.map((slot, index) => {
                const code =
                    slot
                        .closest('figure.code-block')
                        ?.querySelector('pre code')?.textContent ?? '';
                return { slot, code, key: `code-copy-${index}` };
            })
        );

        return () => setSlots([]);
    }, []);

    return slots;
}
