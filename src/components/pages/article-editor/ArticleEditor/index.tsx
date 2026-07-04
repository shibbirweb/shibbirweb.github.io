'use client';

import { useState } from 'react';
import EditorPreview from '@/components/pages/article-editor/ArticleEditor/EditorPreview';
import FrontmatterForm from '@/components/pages/article-editor/ArticleEditor/FrontmatterForm';
import MarkdownInput from '@/components/pages/article-editor/ArticleEditor/MarkdownInput';
import SaveBar from '@/components/pages/article-editor/ArticleEditor/SaveBar';
import { createEmptyDraft } from '@/components/pages/article-editor/ArticleEditor/contents';
import { useUnsavedChangesWarning } from '@/components/pages/article-editor/ArticleEditor/hooks/useUnsavedChangesWarning';
import {
    MOCK_ARTICLE_LIST,
    MOCK_SUGGESTIONS,
    SAMPLE_DRAFT,
} from '@/components/pages/article-editor/ArticleEditor/mockData';
import type { ArticleDraft } from '@/components/pages/article-editor/ArticleEditor/types';
import { slugifyHeading } from '@/lib/markdown';
import { cn } from '@/utils/cn';

export default function ArticleEditor() {
    const [draft, setDraft] = useState<ArticleDraft>(SAMPLE_DRAFT);
    const [savedDraft, setSavedDraft] = useState<ArticleDraft>(SAMPLE_DRAFT);
    // null = the file name follows the title; a string is an author override.
    const [slugOverride, setSlugOverride] = useState<string | null>(null);
    const [savedSlugOverride, setSavedSlugOverride] = useState<string | null>(
        null
    );
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);

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

    function startNewArticle() {
        if (!confirmDiscard()) return;
        const next = createEmptyDraft();
        setDraft(next);
        setSavedDraft(next);
        setSlugOverride(null);
        setSavedSlugOverride(null);
    }

    function openArticle(file: string) {
        if (!confirmDiscard()) return;
        // Real file loading lands in Step 7; the mock just acknowledges.
        window.alert(`Mock open: ${file}. File loading lands in Step 7.`);
    }

    function saveArticle() {
        // Real filesystem save lands in Step 7; here we clear the dirty state.
        setSavedDraft(draft);
        setSavedSlugOverride(slugOverride);
        window.alert('Mock save complete. Filesystem saving lands in Step 7.');
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
                    Shape structured frontmatter and Markdown side by side. This
                    milestone uses fixtures so the complete authoring flow can
                    be reviewed before filesystem wiring begins.
                </p>
            </header>

            <SaveBar
                existing={MOCK_ARTICLE_LIST}
                slug={slug}
                isSlugAuto={slugOverride === null}
                isPreviewVisible={isPreviewVisible}
                isDirty={isDirty}
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
                    suggestions={MOCK_SUGGESTIONS}
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
