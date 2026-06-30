'use client';

import { useState } from 'react';
import Icon from '@/components/admin/ui/Icon';
import { FieldShell } from '@/components/admin/ui/Field';
import { cn } from '@/utils/cn';

/**
 * A visual multi-select for tags / keywords: removable chips, type-ahead
 * suggestions from existing values, and free creation of new ones on Enter.
 */
export default function TagPicker({
    label,
    hint,
    value,
    suggestions,
    onChange,
    placeholder = 'Add and press Enter',
}: {
    label?: string;
    hint?: string;
    value: string[];
    suggestions: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}) {
    const [draft, setDraft] = useState('');

    const add = (raw: string) => {
        const tag = raw.trim();
        if (!tag || value.some((item) => item.toLowerCase() === tag.toLowerCase()))
            return;
        onChange([...value, tag]);
        setDraft('');
    };

    const remove = (tag: string) => onChange(value.filter((item) => item !== tag));

    const matches = draft.trim()
        ? suggestions
              .filter(
                  (suggestion) =>
                      suggestion.toLowerCase().includes(draft.toLowerCase()) &&
                      !value.some(
                          (item) =>
                              item.toLowerCase() === suggestion.toLowerCase()
                      )
              )
              .slice(0, 6)
        : [];

    return (
        <FieldShell label={label} hint={hint}>
            <div className="border-foreground/15 bg-foreground/[0.02] focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 flex flex-wrap items-center gap-1.5 rounded-lg border p-1.5">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="bg-foreground/[0.07] flex min-w-0 max-w-full items-center gap-1 rounded-md py-1 pr-1 pl-2 text-sm"
                    >
                        <span className="truncate">{tag}</span>
                        <button
                            type="button"
                            onClick={() => remove(tag)}
                            aria-label={`Remove ${tag}`}
                            className="text-foreground/40 hover:bg-foreground/10 hover:text-foreground shrink-0 rounded p-0.5"
                        >
                            <Icon name="close" className="size-3" />
                        </button>
                    </span>
                ))}
                <div className="relative min-w-24 flex-1">
                    <input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                add(draft);
                            } else if (
                                event.key === 'Backspace' &&
                                !draft &&
                                value.length
                            ) {
                                remove(value[value.length - 1]);
                            }
                        }}
                        placeholder={placeholder}
                        className="text-foreground placeholder:text-foreground/35 h-7 w-full bg-transparent px-1 text-sm outline-none"
                    />
                    {matches.length > 0 && (
                        <div className="bg-background absolute top-full left-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-foreground/10 p-1 shadow-xl">
                            {matches.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        add(suggestion);
                                    }}
                                    className={cn(
                                        'hover:bg-foreground/[0.07] block w-full rounded-md px-2 py-1.5 text-left text-sm'
                                    )}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </FieldShell>
    );
}
