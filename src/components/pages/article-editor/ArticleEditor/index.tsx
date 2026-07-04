'use client';

import { useState } from 'react';
import EditorPreview from '@/components/pages/article-editor/ArticleEditor/EditorPreview';
import FrontmatterForm from '@/components/pages/article-editor/ArticleEditor/FrontmatterForm';
import MarkdownInput from '@/components/pages/article-editor/ArticleEditor/MarkdownInput';
import SaveBar from '@/components/pages/article-editor/ArticleEditor/SaveBar';
import { createEmptyDraft } from '@/components/pages/article-editor/ArticleEditor/contents';
import { useArticleActions } from '@/components/pages/article-editor/ArticleEditor/hooks/useArticleActions';
import { useUnsavedChangesWarning } from '@/components/pages/article-editor/ArticleEditor/hooks/useUnsavedChangesWarning';
import type {
    ArticleDraft,
    ArticleListItem,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';
import { slugifyHeading } from '@/lib/markdown';
import { cn } from '@/utils/cn';

/** The URL slug a file maps to: extension and `NN-` ordering prefix stripped. */
function fileSlug(file: string): string {
    return file.replace(/\.mdx?$/, '').replace(/^\d+-/, '');
}

export default function ArticleEditor({
    existing,
    suggestions: initialSuggestions,
}: {
    existing: ArticleListItem[];
    suggestions: EditorSuggestions;
}) {
    const [draft, setDraft] = useState<ArticleDraft>(createEmptyDraft);
    const [savedDraft, setSavedDraft] = useState<ArticleDraft>(draft);
    // null = the file name follows the title; a string is an author override.
    const [slugOverride, setSlugOverride] = useState<string | null>(null);
    const [savedSlugOverride, setSavedSlugOverride] = useState<string | null>(
        null
    );
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);

    const { articles, suggestions, saveState, save, open } = useArticleActions(
        existing,
        initialSuggestions
    );

    const autoSlug = slugifyHeading(draft.frontmatter.title) || 'untitled-article';
    const slug = slugOverride ?? autoSlug;

    const isDirty =
        JSON.stringify(draft) !== JSON.stringify(savedDraft) ||
        slugOverride !== savedSlugOverride;
    useUnsavedChangesWarning(isDirty);

    function changeSlug(value: string) {
        const next = slugifyHeading(value);
        // Emptying the field hands the file name back to the title.
        setSlugOverride(next.length > 0 ? next : null);
    }

    /** Guard an article switch behind a confirm when there are unsaved edits. */
    function confirmDiscard() {
        return (
            !isDirty ||
            window.confirm(
                'You have unsaved changes. Discard them and continue?'
            )
        );
    }

    /** Point the save bar at a file's on-disk slug (override only when it differs). */
    function syncSlugToFile(file: string, title: string) {
        const onDisk = fileSlug(file);
        const auto = slugifyHeading(title) || 'untitled-article';
        const override = onDisk === auto ? null : onDisk;
        setSlugOverride(override);
        setSavedSlugOverride(override);
    }

    function startNewArticle() {
        if (!confirmDiscard()) return;
        const next = createEmptyDraft();
        setDraft(next);
        setSavedDraft(next);
        setSlugOverride(null);
        setSavedSlugOverride(null);
    }

    async function openArticle(file: string) {
        if (!confirmDiscard()) return;
        const loaded = await open(file);
        setDraft(loaded);
        setSavedDraft(loaded);
        syncSlugToFile(file, loaded.frontmatter.title);
    }

    async function saveArticle() {
        const result = await save(draft, slug);
        if (!result) return; // save failed; keep the dirty state for a retry
        setSavedDraft(draft);
        syncSlugToFile(result.file, draft.frontmatter.title);
    }

    return (
        <main className="mx-auto w-full max-w-[112rem] px-4 py-24 sm:px-6 lg:px-8">
            <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-foreground/50 text-sm font-semibold tracking-[0.2em] uppercase">
                        Studio
                    </p>
                    <span className="border-foreground/10 bg-foreground/5 rounded-full border px-2.5 py-1 text-xs">
                        Development only
                    </span>
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
                    Article Editor
                </h1>
                <p className="text-foreground/65 mt-3 max-w-3xl">
                    Shape structured frontmatter and Markdown side by side, then
                    save straight to the content folder. Reads and writes the real
                    article files through the dev server, with a live preview
                    rendered by the same components the published site uses.
                </p>
            </header>

            <SaveBar
                existing={articles}
                slug={slug}
                isSlugAuto={slugOverride === null}
                isPreviewVisible={isPreviewVisible}
                isDirty={isDirty}
                saveState={saveState}
                onSlugChange={changeSlug}
                onResetSlug={() => setSlugOverride(null)}
                onNew={startNewArticle}
                onOpen={openArticle}
                onSave={saveArticle}
                onTogglePreview={() =>
                    setIsPreviewVisible((isVisible) => !isVisible)
                }
            />

            <div className="grid gap-6">
                <FrontmatterForm
                    frontmatter={draft.frontmatter}
                    suggestions={suggestions}
                    onChange={(patch) =>
                        setDraft((current) => ({
                            ...current,
                            frontmatter: {
                                ...current.frontmatter,
                                ...patch,
                            },
                        }))
                    }
                />
                <div
                    className={cn(
                        'grid items-stretch gap-6',
                        isPreviewVisible &&
                            'xl:grid-cols-[minmax(0,1fr)_minmax(28rem,1fr)]'
                    )}
                >
                    <MarkdownInput
                        value={draft.body}
                        onChange={(body) =>
                            setDraft((current) => ({ ...current, body }))
                        }
                    />
                    {isPreviewVisible && (
                        <div className="min-h-0 xl:relative">
                            <div className="xl:absolute xl:inset-0">
                                <EditorPreview body={draft.body} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
