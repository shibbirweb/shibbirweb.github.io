'use client';

import { useState } from 'react';
import EditorToolbar from '@/components/admin/Editor/EditorToolbar';
import SlashMenu from '@/components/admin/Editor/SlashMenu';
import InsertDialogs from '@/components/admin/Editor/dialogs';
import { useTextareaCommands } from '@/components/admin/Editor/hooks/useTextareaCommands';
import { getCaretCoordinates } from '@/components/admin/Editor/caretCoordinates';
import {
    COMMANDS,
    INLINE_COMMANDS,
    filterSlashCommands,
    type DialogKind,
} from '@/components/admin/Editor/commands';
import {
    insertBlock,
    replaceSelection,
    type EditorState,
} from '@/components/admin/Editor/markdown';
import { cn } from '@/utils/cn';
import type { Placement } from '@/components/admin/Editor/dialogs/types';

interface SlashState {
    anchor: number;
    query: string;
    index: number;
    position: { top: number; left: number };
}

/** A "/" token at line start or after whitespace, with no spaces after it. */
function findSlashToken(
    value: string,
    caret: number
): { anchor: number; query: string } | null {
    for (let i = caret - 1; i >= 0; i--) {
        const char = value[i];
        if (char === '/') {
            const previous = i > 0 ? value[i - 1] : '\n';
            if (i === 0 || previous === '\n' || previous === ' ')
                return { anchor: i, query: value.slice(i + 1, caret) };
            return null;
        }
        if (char === '\n' || char === ' ' || char === '\t') return null;
    }
    return null;
}

/**
 * The Markdown editing surface. In `rich` mode it adds a formatting toolbar, a
 * slash command menu at the caret, and block insert dialogs; `raw` mode is a
 * plain monospace view of the same Markdown. Both edit one string, so switching
 * modes never loses or transforms content.
 */
export default function MarkdownEditor({
    value,
    onChange,
    variant,
    placeholder,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    variant: 'rich' | 'raw';
    placeholder?: string;
    className?: string;
}) {
    const { ref, getState, applyState, apply } = useTextareaCommands(
        value,
        onChange
    );
    const [slash, setSlash] = useState<SlashState | null>(null);
    const [dialog, setDialog] = useState<{
        kind: DialogKind;
        seed: string;
    } | null>(null);

    const slashItems = slash ? filterSlashCommands(slash.query) : [];

    function openDialog(kind: DialogKind, seed?: string) {
        const state = getState();
        setDialog({ kind, seed: seed ?? state.value.slice(state.start, state.end) });
    }

    function runCommand(commandId: string) {
        const inlineCommand = INLINE_COMMANDS.find((c) => c.id === commandId);
        if (inlineCommand) {
            apply(inlineCommand.run);
            return;
        }
        const command = COMMANDS[commandId];
        if (!command) return;
        if (command.dialog) openDialog(command.dialog);
        else if (command.run) apply(command.run);
    }

    function handleInsert(markdown: string, placement: Placement = 'block') {
        apply((state: EditorState) =>
            placement === 'inline'
                ? replaceSelection(state, markdown)
                : insertBlock(state, markdown)
        );
        setDialog(null);
    }

    function refreshSlash(element: HTMLTextAreaElement) {
        if (variant !== 'rich') return;
        const token = findSlashToken(element.value, element.selectionStart);
        if (!token) {
            setSlash(null);
            return;
        }
        const coordinates = getCaretCoordinates(element, token.anchor);
        const left = Math.max(
            8,
            Math.min(
                coordinates.left - element.scrollLeft,
                element.clientWidth - 296
            )
        );
        const top = coordinates.top - element.scrollTop + coordinates.height + 6;
        setSlash((current) => ({
            anchor: token.anchor,
            query: token.query,
            index: current && current.query === token.query ? current.index : 0,
            position: { top, left },
        }));
    }

    function selectSlashCommand(commandId: string) {
        const element = ref.current;
        if (!element || !slash) return;
        const caret = slash.anchor + 1 + slash.query.length;
        const cleared: EditorState = {
            value:
                element.value.slice(0, slash.anchor) + element.value.slice(caret),
            start: slash.anchor,
            end: slash.anchor,
        };
        setSlash(null);

        const inlineCommand = INLINE_COMMANDS.find((c) => c.id === commandId);
        if (inlineCommand) {
            applyState(inlineCommand.run(cleared));
            return;
        }
        const command = COMMANDS[commandId];
        if (command?.dialog) {
            applyState(cleared);
            openDialog(command.dialog, '');
        } else if (command?.run) {
            applyState(command.run(cleared));
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (slash && slashItems.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSlash({
                    ...slash,
                    index: (slash.index + 1) % slashItems.length,
                });
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSlash({
                    ...slash,
                    index:
                        (slash.index - 1 + slashItems.length) %
                        slashItems.length,
                });
                return;
            }
            if (event.key === 'Enter' || event.key === 'Tab') {
                event.preventDefault();
                selectSlashCommand(slashItems[slash.index].id);
                return;
            }
        }
        if (slash && event.key === 'Escape') {
            event.preventDefault();
            setSlash(null);
            return;
        }
        if ((event.metaKey || event.ctrlKey) && !event.altKey) {
            const key = event.key.toLowerCase();
            if (key === 'b') {
                event.preventDefault();
                runCommand('bold');
            } else if (key === 'i') {
                event.preventDefault();
                runCommand('italic');
            } else if (key === 'k') {
                event.preventDefault();
                runCommand('link');
            }
        }
    }

    return (
        <div className={cn('flex h-full min-h-0 flex-col', className)}>
            {variant === 'rich' && <EditorToolbar onCommand={runCommand} />}
            <div className="relative min-h-0 flex-1">
                <textarea
                    ref={ref}
                    value={value}
                    onChange={(event) => {
                        onChange(event.target.value);
                        refreshSlash(event.target);
                    }}
                    onKeyDown={handleKeyDown}
                    // Re-evaluate the slash token on any caret move (arrow keys,
                    // Home/End, click), so the menu never acts on a stale anchor.
                    onSelect={(event) => refreshSlash(event.currentTarget)}
                    onBlur={() => setSlash(null)}
                    placeholder={placeholder}
                    spellCheck={variant === 'rich'}
                    className={cn(
                        'text-foreground placeholder:text-foreground/35 h-full w-full resize-none overflow-auto bg-transparent p-4 outline-none sm:p-6',
                        variant === 'rich'
                            ? 'font-sans text-[15px] leading-7'
                            : 'font-mono text-sm leading-6'
                    )}
                />
                {slash && (
                    <SlashMenu
                        items={slashItems}
                        activeIndex={slash.index}
                        position={slash.position}
                        onSelect={selectSlashCommand}
                        onHover={(index) => setSlash({ ...slash, index })}
                    />
                )}
            </div>

            <InsertDialogs
                kind={dialog?.kind ?? null}
                initialText={dialog?.seed}
                onInsert={handleInsert}
                onClose={() => setDialog(null)}
            />
        </div>
    );
}
