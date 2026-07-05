'use client';

import { useCallback, useRef } from 'react';

/**
 * Splices writing-guide snippets into the Markdown textarea at the caret. Holds
 * the textarea ref the editor wires onto `MarkdownInput`, and returns
 * `insertSnippet`, which inserts at the current selection (or the end of the body
 * when the textarea is unfocused), then refocuses with the caret after the text.
 * The refocus runs in `requestAnimationFrame` so it lands after the modal that
 * triggered the insert unmounts and its chrome restores focus to the trigger.
 */
export function useMarkdownInsertion(
    body: string,
    setBody: (body: string) => void
) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertSnippet = useCallback(
        (text: string) => {
            const textarea = textareaRef.current;
            const start = textarea?.selectionStart ?? body.length;
            const end = textarea?.selectionEnd ?? body.length;
            const next = `${body.slice(0, start)}${text}${body.slice(end)}`;
            const caret = start + text.length;
            setBody(next);
            requestAnimationFrame(() => {
                textarea?.focus();
                textarea?.setSelectionRange(caret, caret);
            });
        },
        [body, setBody]
    );

    return { textareaRef, insertSnippet };
}
