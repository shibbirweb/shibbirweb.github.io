'use client';

import type { SaveState } from '@/components/pages/article-editor/ArticleEditor/hooks/useArticleActions';
import type { ArticleListItem } from '@/components/pages/article-editor/ArticleEditor/types';

export default function SaveBar({
    existing,
    slug,
    isSlugAuto,
    isPreviewVisible,
    isDirty,
    saveState,
    onSlugChange,
    onResetSlug,
    onNew,
    onOpen,
    onSave,
    onPreview,
    onTogglePreview,
}: {
    existing: ArticleListItem[];
    slug: string;
    isSlugAuto: boolean;
    isPreviewVisible: boolean;
    isDirty: boolean;
    saveState: SaveState;
    onSlugChange: (value: string) => void;
    onResetSlug: () => void;
    onNew: () => void;
    onOpen: (file: string) => void;
    onSave: () => void;
    onPreview: () => void;
    onTogglePreview: () => void;
}) {
    const isSaving = saveState.status === 'saving';
    return (
        <div className="border-foreground/10 bg-background/85 mb-6 flex flex-wrap items-center gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur-xl">
            <div className="min-w-0 grow px-2">
                <p className="text-foreground/45 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
                    File name
                    {isDirty && (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 tracking-normal normal-case">
                            <span
                                aria-hidden
                                className="size-1.5 rounded-full bg-current"
                            />
                            Unsaved
                        </span>
                    )}
                </p>
                <div className="mt-0.5 flex items-center gap-1 font-mono text-sm">
                    <span className="text-foreground/45 shrink-0">NN-</span>
                    <input
                        aria-label="File name slug"
                        value={slug}
                        onChange={(event) => onSlugChange(event.target.value)}
                        className="focus:border-foreground/40 min-w-0 flex-1 border-b border-transparent bg-transparent py-0.5 outline-none"
                    />
                    <span className="text-foreground/45 shrink-0">.md</span>
                    {!isSlugAuto && (
                        <button
                            type="button"
                            className="text-foreground/50 hover:text-foreground shrink-0 cursor-pointer px-1 font-sans text-xs underline underline-offset-2"
                            onClick={onResetSlug}
                        >
                            Reset to title
                        </button>
                    )}
                </div>
            </div>
            <button
                type="button"
                className="border-foreground/15 hover:bg-foreground/5 cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                onClick={onNew}
            >
                New article
            </button>
            <label
                className="sr-only"
                htmlFor="mock-open-article"
            >
                Open article
            </label>
            <select
                id="mock-open-article"
                className="border-foreground/15 bg-background cursor-pointer rounded-xl border px-3 py-2 text-sm"
                value=""
                onChange={(event) => {
                    if (event.target.value) onOpen(event.target.value);
                }}
            >
                <option
                    value=""
                    disabled
                >
                    Open article
                </option>
                {existing.map((article) => (
                    <option
                        key={article.file}
                        value={article.file}
                    >
                        {article.status === 'draft' ? '[Draft] ' : ''}
                        {article.title}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="border-foreground/15 hover:bg-foreground/5 cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                aria-pressed={isPreviewVisible}
                onClick={onTogglePreview}
            >
                {isPreviewVisible ? 'Hide preview' : 'Show preview'}
            </button>
            <button
                type="button"
                className="border-foreground/15 hover:bg-foreground/5 cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                onClick={onPreview}
            >
                Full preview
            </button>
            <button
                type="button"
                className="bg-foreground text-background hover:bg-foreground/85 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                onClick={onSave}
            >
                {isSaving ? 'Saving...' : 'Save'}
            </button>
            {(saveState.status === 'saved' || saveState.status === 'error') && (
                <p
                    role="status"
                    className={
                        saveState.status === 'error'
                            ? 'text-red-600 dark:text-red-400 w-full px-2 text-xs'
                            : 'text-foreground/55 w-full px-2 text-xs'
                    }
                >
                    {saveState.message}
                </p>
            )}
        </div>
    );
}
