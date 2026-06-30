'use client';

import { useLayoutEffect, useRef } from 'react';
import type { EditorState } from '@/components/admin/Editor/markdown';

/**
 * Bridges the pure Markdown transforms to a controlled textarea. It reads the
 * live selection, applies a transform, pushes the new value up, and restores the
 * caret after React re-renders, so formatting actions keep the selection sane.
 */
export function useTextareaCommands(
    value: string,
    onChange: (value: string) => void
) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const pendingSelection = useRef<[number, number] | null>(null);

    useLayoutEffect(() => {
        if (pendingSelection.current && ref.current) {
            const [start, end] = pendingSelection.current;
            ref.current.focus();
            ref.current.setSelectionRange(start, end);
            pendingSelection.current = null;
        }
    });

    const getState = (): EditorState => {
        const element = ref.current;
        if (!element)
            return { value, start: value.length, end: value.length };
        return {
            value: element.value,
            start: element.selectionStart,
            end: element.selectionEnd,
        };
    };

    const applyState = (next: EditorState) => {
        pendingSelection.current = [next.start, next.end];
        onChange(next.value);
    };

    const apply = (transform: (state: EditorState) => EditorState) =>
        applyState(transform(getState()));

    return { ref, getState, applyState, apply };
}
