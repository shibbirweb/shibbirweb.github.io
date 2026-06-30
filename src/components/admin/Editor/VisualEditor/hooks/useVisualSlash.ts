'use client';

import { useState, type RefObject } from 'react';
import {
    filterSlashCommands,
    type CommandDef,
} from '@/components/admin/Editor/commands';

interface SlashState {
    query: string;
    index: number;
    position: { top: number; left: number };
    node: Node;
    start: number;
}

/**
 * The at-caret slash menu for the WYSIWYG surface. It detects a "/" token in the
 * caret's text node, anchors the menu to the caret rectangle, and on selection
 * removes the typed token before running the chosen command. Keyboard navigation
 * is handled through the returned `onKeyDown`.
 */
export function useVisualSlash(
    ref: RefObject<HTMLElement | null>,
    run: (commandId: string) => void
) {
    const [slash, setSlash] = useState<SlashState | null>(null);
    const items: CommandDef[] = slash ? filterSlashCommands(slash.query) : [];

    const close = () => setSlash(null);

    const detect = () => {
        const root = ref.current;
        const selection = window.getSelection();
        if (
            !root ||
            !selection ||
            !selection.isCollapsed ||
            selection.rangeCount === 0
        ) {
            setSlash(null);
            return;
        }
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE || !root.contains(node)) {
            setSlash(null);
            return;
        }
        const text = node.textContent ?? '';
        const caret = range.startOffset;
        for (let i = caret - 1; i >= 0; i--) {
            const char = text[i];
            if (char === '/') {
                const previous = i > 0 ? text[i - 1] : '';
                if (i === 0 || /\s/.test(previous)) {
                    const query = text.slice(i + 1, caret);
                    if (/\s/.test(query)) {
                        setSlash(null);
                        return;
                    }
                    const rect = range.getBoundingClientRect();
                    setSlash((current) => ({
                        query,
                        index: current && current.query === query ? current.index : 0,
                        position: { top: rect.bottom + 6, left: rect.left },
                        node,
                        start: i,
                    }));
                    return;
                }
                setSlash(null);
                return;
            }
            if (/\s/.test(char)) break;
        }
        setSlash(null);
    };

    const select = (commandId: string) => {
        if (!slash) return;
        const remove = document.createRange();
        remove.setStart(slash.node, slash.start);
        remove.setEnd(slash.node, slash.start + 1 + slash.query.length);
        remove.deleteContents();
        const caret = document.createRange();
        caret.setStart(slash.node, slash.start);
        caret.collapse(true);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(caret);
        setSlash(null);
        run(commandId);
    };

    const onKeyDown = (event: React.KeyboardEvent): boolean => {
        if (!slash || items.length === 0) {
            if (slash && event.key === 'Escape') {
                event.preventDefault();
                setSlash(null);
                return true;
            }
            return false;
        }
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSlash({ ...slash, index: (slash.index + 1) % items.length });
                return true;
            case 'ArrowUp':
                event.preventDefault();
                setSlash({
                    ...slash,
                    index: (slash.index - 1 + items.length) % items.length,
                });
                return true;
            case 'Enter':
            case 'Tab':
                event.preventDefault();
                select(items[slash.index].id);
                return true;
            case 'Escape':
                event.preventDefault();
                setSlash(null);
                return true;
            default:
                return false;
        }
    };

    return {
        slash,
        items,
        detect,
        onKeyDown,
        select,
        setIndex: (index: number) =>
            setSlash((current) => (current ? { ...current, index } : current)),
        close,
    };
}
