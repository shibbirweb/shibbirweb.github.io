'use client';

import { createPortal } from 'react-dom';
import CodeCopyButton from '@/components/pages/articles/CodeBlock/CodeCopyButton';
import { useCodeCopySlots } from '@/components/pages/articles/CodeBlock/hooks/useCodeCopySlots';

/**
 * Adds a copy button to every Shiki code block in the article body. The block
 * header (language/extension + file path) is static HTML from `posts.ts`; here
 * we portal a copy button into each header slot. Renders nothing itself.
 */
export default function CodeBlockCopy() {
    const slots = useCodeCopySlots();
    return (
        <>
            {slots.map(({ slot, code, key }) =>
                createPortal(<CodeCopyButton code={code} />, slot, key)
            )}
        </>
    );
}
