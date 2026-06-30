'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    COMMANDS,
    DETAILS_TEMPLATE,
    type DialogKind,
} from '@/components/admin/Editor/commands';
import {
    fragmentFromMarkdown,
    htmlToMarkdown,
    inlineFragmentFromMarkdown,
    markdownToHtml,
    parseCodeInfo,
} from '@/components/admin/Editor/VisualEditor/wysiwyg';
import {
    duplicateBlock,
    insertBlock,
    insertInlineHtml,
    moveBlock,
    replaceElement,
    wrapSelection,
} from '@/components/admin/Editor/VisualEditor/domEdit';
import { uploadImage } from '@/components/admin/api';
import type {
    DialogInitial,
    Placement,
} from '@/components/admin/Editor/dialogs/types';

interface DialogState {
    kind: DialogKind;
    seed: string;
    initial?: DialogInitial;
    editEl: Element | null;
}

/**
 * The engine behind the WYSIWYG Visual editor. It owns the contentEditable
 * lifecycle (initial render from Markdown, serialize back on edit), command
 * dispatch (inline/block formatting and block inserts), the at-caret slash menu,
 * the click-to-edit flow for atomic widgets, and the insert dialogs. All effects
 * and listeners live here so the component reads top-down: call the hook, render.
 */
export function useVisualEditor(
    value: string,
    onChange: (markdown: string) => void
) {
    const ref = useRef<HTMLDivElement>(null);
    const lastMarkdownRef = useRef(value);
    const initializedRef = useRef(false);
    const serializeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [dialog, setDialog] = useState<DialogState | null>(null);
    const dialogRef = useRef<DialogState | null>(null);
    dialogRef.current = dialog;

    const updateEmpty = useCallback(() => {
        const root = ref.current;
        if (!root) return;
        const empty =
            (root.textContent ?? '').trim() === '' &&
            !root.querySelector('[data-md], img, hr, table');
        root.dataset.empty = empty ? 'true' : 'false';
    }, []);

    const serialize = useCallback(() => {
        const root = ref.current;
        if (!root) return;
        updateEmpty();
        const markdown = htmlToMarkdown(root.innerHTML);
        if (markdown !== lastMarkdownRef.current) {
            lastMarkdownRef.current = markdown;
            onChange(markdown);
        }
    }, [onChange, updateEmpty]);

    const serializeSoon = useCallback(() => {
        if (serializeTimer.current) clearTimeout(serializeTimer.current);
        serializeTimer.current = setTimeout(serialize, 250);
    }, [serialize]);

    // Render the Markdown into the surface once on mount (and on remount when
    // returning to Visual mode), never on our own serialize-driven changes.
    useEffect(() => {
        const root = ref.current;
        if (!root || initializedRef.current) return;
        initializedRef.current = true;
        root.innerHTML = markdownToHtml(value) || '<p><br></p>';
        lastMarkdownRef.current = value;
        updateEmpty();
    }, [value, updateEmpty]);

    useEffect(
        () => () => {
            if (serializeTimer.current) clearTimeout(serializeTimer.current);
        },
        []
    );

    const openDialog = useCallback(
        (kind: DialogKind, editEl: Element | null = null, initial?: DialogInitial) => {
            const selection = window.getSelection();
            const seed = selection ? selection.toString() : '';
            setDialog({ kind, seed, initial, editEl });
        },
        []
    );

    const applyCommand = useCallback(
        (id: string) => {
            const root = ref.current;
            if (!root) return;
            switch (id) {
                case 'bold':
                    document.execCommand('bold');
                    break;
                case 'italic':
                    document.execCommand('italic');
                    break;
                case 'underline':
                    document.execCommand('underline');
                    break;
                case 'strike':
                    document.execCommand('strikeThrough');
                    break;
                case 'inlineCode':
                    wrapSelection(root, 'code');
                    break;
                case 'highlight':
                    wrapSelection(root, 'mark');
                    break;
                case 'h2':
                    document.execCommand('formatBlock', false, 'h2');
                    break;
                case 'h3':
                    document.execCommand('formatBlock', false, 'h3');
                    break;
                case 'quote':
                    document.execCommand('formatBlock', false, 'blockquote');
                    break;
                case 'bulletList':
                    document.execCommand('insertUnorderedList');
                    break;
                case 'numberedList':
                    document.execCommand('insertOrderedList');
                    break;
                case 'taskList':
                    insertBlock(root, fragmentFromMarkdown('- [ ] '));
                    break;
                case 'callout':
                    insertBlock(root, fragmentFromMarkdown('> **Note:** '));
                    break;
                case 'divider':
                    insertBlock(root, fragmentFromMarkdown('---'));
                    break;
                case 'details':
                    insertBlock(root, fragmentFromMarkdown(DETAILS_TEMPLATE));
                    break;
                default:
                    return;
            }
            serializeSoon();
        },
        [serializeSoon]
    );

    const runCommand = useCallback(
        (id: string) => {
            ref.current?.focus();
            const command = COMMANDS[id];
            if (command?.dialog) {
                openDialog(command.dialog);
                return;
            }
            applyCommand(id);
        },
        [applyCommand, openDialog]
    );

    const insertFromDialog = useCallback(
        (markdown: string, placement: Placement = 'block') => {
            const root = ref.current;
            if (!root) return;
            root.focus();
            const editing = dialogRef.current?.editEl;
            if (editing) {
                replaceElement(editing, fragmentFromMarkdown(markdown));
            } else if (placement === 'inline') {
                insertInlineHtml(root, inlineFragmentFromMarkdown(markdown));
            } else {
                insertBlock(root, fragmentFromMarkdown(markdown));
            }
            setDialog(null);
            serializeSoon();
        },
        [serializeSoon]
    );

    // Click an atomic widget (code / Mermaid / gist) to reopen its dialog.
    const onClick = useCallback(
        (event: React.MouseEvent) => {
            const widget = (event.target as HTMLElement).closest('[data-md]');
            if (!widget) return;
            const kind = widget.getAttribute('data-kind');
            const source = decodeURIComponent(
                widget.getAttribute('data-md') ?? ''
            );
            if (kind === 'code' || kind === 'mermaid') {
                const match = source.match(/^```([^\n]*)\n([\s\S]*?)\n```$/);
                const code = match?.[2] ?? '';
                if (kind === 'mermaid') {
                    openDialog('mermaid', widget, { code });
                } else {
                    const { lang, filePath } = parseCodeInfo(match?.[1] ?? '');
                    openDialog('code', widget, { lang, filePath, code });
                }
            } else if (kind === 'gist') {
                openDialog('gist', widget, { url: source });
            }
        },
        [openDialog]
    );

    // Block-level keyboard ops: move the current block (Alt+Up/Down) and
    // duplicate it (Ctrl/Cmd+Shift+D). Returns true when it handled the key.
    const onKeyDown = useCallback(
        (event: React.KeyboardEvent): boolean => {
            const root = ref.current;
            if (!root) return false;
            if (event.altKey && event.key === 'ArrowUp') {
                if (moveBlock(root, -1)) {
                    event.preventDefault();
                    serializeSoon();
                    return true;
                }
            } else if (event.altKey && event.key === 'ArrowDown') {
                if (moveBlock(root, 1)) {
                    event.preventDefault();
                    serializeSoon();
                    return true;
                }
            } else if (
                (event.metaKey || event.ctrlKey) &&
                event.shiftKey &&
                event.key.toLowerCase() === 'd'
            ) {
                event.preventDefault();
                duplicateBlock(root);
                serializeSoon();
                return true;
            }
            return false;
        },
        [serializeSoon]
    );

    // Paste an image from the clipboard: upload it and insert an image block.
    const onPaste = useCallback(
        (event: React.ClipboardEvent) => {
            const file = Array.from(event.clipboardData?.items ?? [])
                .find((item) => item.type.startsWith('image/'))
                ?.getAsFile();
            if (!file) return;
            event.preventDefault();
            const root = ref.current;
            uploadImage(file)
                .then(({ path }) => {
                    if (root)
                        insertBlock(root, fragmentFromMarkdown(`![](${path})`));
                    serializeSoon();
                })
                .catch(() => {
                    /* surfaced by the dashboard/editor toasts elsewhere */
                });
        },
        [serializeSoon]
    );

    return {
        ref,
        dialog,
        runCommand,
        insertFromDialog,
        closeDialog: () => setDialog(null),
        onInput: () => {
            updateEmpty();
            serializeSoon();
        },
        onKeyDown,
        onPaste,
        onBlur: serialize,
        onClick,
        flush: serialize,
    };
}
