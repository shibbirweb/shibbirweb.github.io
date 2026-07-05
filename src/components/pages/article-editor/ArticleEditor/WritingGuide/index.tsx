'use client';

import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { jetBrainsMono } from '@/config/monoFont';
import GuideSection from '@/components/pages/article-editor/ArticleEditor/WritingGuide/GuideSection';
import { guideGroups } from '@/components/pages/article-editor/ArticleEditor/WritingGuide/contents';
import { useModalChrome } from '@/components/pages/articles/hooks/useModalChrome';
import { cn } from '@/utils/cn';

export default function WritingGuide({
    onClose,
    onInsert,
    onLoadExample,
}: {
    onClose: () => void;
    onInsert: (snippet: string) => void;
    onLoadExample: () => void;
}) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    useModalChrome(onClose, closeButtonRef);

    const neutralButtonClassName =
        'border-foreground/15 hover:bg-foreground/5 cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-colors';

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Writing guide"
            className="bg-background/60 fixed inset-0 z-50 flex items-start justify-center px-4 pt-[8vh] pb-8 backdrop-blur-md"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={cn(
                    jetBrainsMono.variable,
                    'border-foreground/10 bg-background flex max-h-[84vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl'
                )}
            >
                <header className="border-foreground/10 flex items-start justify-between gap-4 border-b p-5 sm:p-6">
                    <div>
                        <p className="text-foreground/45 text-xs font-semibold tracking-[0.2em] uppercase">
                            Writing guide
                        </p>
                        <h2 className="mt-1 text-xl font-semibold">
                            Article anatomy
                        </h2>
                        <p className="text-foreground/60 mt-1 text-sm">
                            The frontmatter fields and body features an article can
                            use. Insert a body snippet at your cursor, or load the
                            full example.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            className={neutralButtonClassName}
                            onClick={onLoadExample}
                        >
                            Load full example
                        </button>
                        <button
                            ref={closeButtonRef}
                            type="button"
                            className={neutralButtonClassName}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </header>
                <div className="grid gap-8 overflow-y-auto p-5 sm:p-6">
                    {guideGroups.map((group) => (
                        <GuideSection
                            key={group.title}
                            title={group.title}
                            entries={group.entries}
                            onInsert={onInsert}
                        />
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}
