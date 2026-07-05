'use client';

import { useState } from 'react';
import type { GuideEntry as GuideEntryData } from '@/components/pages/article-editor/ArticleEditor/WritingGuide/types';
import { cn } from '@/utils/cn';

const actionButtonClassName =
    'border-foreground/15 hover:bg-foreground/5 cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors';

export default function GuideEntry({
    entry,
    onInsert,
}: {
    entry: GuideEntryData;
    onInsert: (snippet: string) => void;
}) {
    const [copied, setCopied] = useState(false);

    async function copySnippet() {
        await navigator.clipboard.writeText(entry.snippet);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="border-foreground/10 bg-background/40 rounded-xl border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-mono text-sm font-semibold">{entry.label}</p>
            </div>
            <p className="text-foreground/60 mt-1 text-xs leading-relaxed">
                {entry.note}
            </p>
            <pre className="border-foreground/10 bg-foreground/[0.03] mt-3 overflow-x-auto rounded-lg border p-3 font-mono text-[12px] leading-5">
                {entry.snippet}
            </pre>
            {entry.insert && (
                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        className={cn(
                            actionButtonClassName,
                            'bg-foreground text-background hover:bg-foreground/85 border-transparent'
                        )}
                        onClick={() => onInsert(entry.insert!)}
                    >
                        Insert
                    </button>
                    <button
                        type="button"
                        className={actionButtonClassName}
                        onClick={copySnippet}
                    >
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            )}
        </div>
    );
}
