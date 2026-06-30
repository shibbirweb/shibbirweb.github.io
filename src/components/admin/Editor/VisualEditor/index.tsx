'use client';

import { createPortal } from 'react-dom';
import EditorToolbar from '@/components/admin/Editor/EditorToolbar';
import SlashMenu from '@/components/admin/Editor/SlashMenu';
import InsertDialogs from '@/components/admin/Editor/dialogs';
import SelectionToolbar from '@/components/admin/Editor/VisualEditor/SelectionToolbar';
import { useVisualEditor } from '@/components/admin/Editor/VisualEditor/hooks/useVisualEditor';
import { useVisualSlash } from '@/components/admin/Editor/VisualEditor/hooks/useVisualSlash';
import { useSelectionBubble } from '@/components/admin/Editor/VisualEditor/hooks/useSelectionBubble';
import { jetBrainsMono } from '@/config/monoFont';
import { cn } from '@/utils/cn';
import styles from '@/components/admin/Editor/VisualEditor/VisualEditor.module.css';

/**
 * The WYSIWYG Visual editor. A contentEditable surface styled with the same
 * Tailwind Typography `prose` as the article page, so Markdown is shown as
 * formatted content rather than raw syntax. Markdown stays the source of truth:
 * the engine serializes the surface back to Markdown on every edit. A toolbar,
 * an at-caret slash menu, and a selection bubble cover all formatting.
 */
export default function VisualEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (markdown: string) => void;
}) {
    const editor = useVisualEditor(value, onChange);
    const slash = useVisualSlash(editor.ref, editor.runCommand);
    const bubble = useSelectionBubble(editor.ref);

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col">
            <EditorToolbar onCommand={editor.runCommand} />
            <div className="min-h-0 flex-1 overflow-auto">
                <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
                    <div
                        ref={editor.ref}
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck
                        role="textbox"
                        aria-multiline="true"
                        aria-label="Article content"
                        onInput={() => {
                            editor.onInput();
                            slash.detect();
                        }}
                        onKeyDown={(event) => {
                            if (slash.onKeyDown(event)) return;
                            editor.onKeyDown(event);
                        }}
                        onPaste={editor.onPaste}
                        onBlur={() => {
                            editor.onBlur();
                            slash.close();
                        }}
                        onClick={editor.onClick}
                        className={cn(
                            jetBrainsMono.variable,
                            'prose prose-lg dark:prose-invert max-w-none',
                            styles.editor
                        )}
                    />
                </div>
            </div>
            {slash.slash &&
                typeof document !== 'undefined' &&
                createPortal(
                    <SlashMenu
                        items={slash.items}
                        activeIndex={slash.slash.index}
                        position={slash.slash.position}
                        fixed
                        onSelect={slash.select}
                        onHover={slash.setIndex}
                    />,
                    document.body
                )}
            {bubble && !slash.slash && (
                <SelectionToolbar rect={bubble} onCommand={editor.runCommand} />
            )}
            <InsertDialogs
                kind={editor.dialog?.kind ?? null}
                initialText={editor.dialog?.seed}
                initial={editor.dialog?.initial}
                onInsert={editor.insertFromDialog}
                onClose={editor.closeDialog}
            />
        </div>
    );
}
