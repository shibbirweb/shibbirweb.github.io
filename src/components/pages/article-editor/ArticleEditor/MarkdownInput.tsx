'use client';

import type { KeyboardEvent } from 'react';
import { jetBrainsMono } from '@/config/monoFont';
import { cn } from '@/utils/cn';

export default function MarkdownInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key !== 'Tab') return;
        event.preventDefault();
        const textarea = event.currentTarget;
        const next = `${value.slice(0, textarea.selectionStart)}    ${value.slice(textarea.selectionEnd)}`;
        const cursor = textarea.selectionStart + 4;
        onChange(next);
        requestAnimationFrame(() => textarea.setSelectionRange(cursor, cursor));
    }

    return (
        <section className="border-foreground/10 bg-background/45 rounded-2xl border p-4 shadow-sm backdrop-blur sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="text-foreground/45 text-xs font-semibold tracking-[0.2em] uppercase">
                        Markdown
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">Article body</h2>
                </div>
                <span className="text-foreground/45 text-xs">
                    {value.length.toLocaleString()} characters
                </span>
            </div>
            <textarea
                className={cn(
                    jetBrainsMono.variable,
                    'border-foreground/15 bg-foreground/[0.025] focus:border-foreground/40 min-h-[46rem] w-full resize-y rounded-xl border p-4 font-mono text-[13px] leading-6 transition outline-none'
                )}
                value={value}
                spellCheck
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Article Markdown"
            />
        </section>
    );
}
