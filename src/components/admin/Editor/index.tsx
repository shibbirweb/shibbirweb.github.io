'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EditorTopBar from '@/components/admin/Editor/EditorTopBar';
import EditorPane from '@/components/admin/Editor/EditorPane';
import VisualEditor from '@/components/admin/Editor/VisualEditor';
import MarkdownEditor from '@/components/admin/Editor/MarkdownEditor';
import SplitView from '@/components/admin/Editor/SplitView';
import LivePreview from '@/components/admin/Editor/LivePreview';
import FrontmatterDrawer from '@/components/admin/Editor/FrontmatterDrawer';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import Spinner from '@/components/admin/ui/Spinner';
import Button from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import { useToast } from '@/components/admin/ui/Toast';
import { useArticleDraft } from '@/components/admin/Editor/hooks/useArticleDraft';
import { useEditorShortcuts } from '@/components/admin/Editor/hooks/useEditorShortcuts';
import { useUnsavedGuard } from '@/components/admin/Editor/hooks/useUnsavedGuard';
import { useMeta } from '@/components/admin/Editor/hooks/useMeta';
import { editorHref } from '@/components/admin/Dashboard/links';
import { articleAction, deleteArticle } from '@/components/admin/api';
import { validateForPublish } from '@/lib/admin/validate';
import type { EditorMode } from '@/components/admin/Editor/mode';

export default function ArticleEditor() {
    const router = useRouter();
    const notify = useToast();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const draft = useArticleDraft(id);
    const meta = useMeta();

    const [mode, setMode] = useState<EditorMode>('visual');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [publishIssues, setPublishIssues] = useState<string[] | null>(null);

    useUnsavedGuard(draft.dirty);

    const fail = (caught: unknown, fallback: string) =>
        notify(caught instanceof Error ? caught.message : fallback, 'error');

    const handleSave = useCallback(async () => {
        setBusy(true);
        try {
            await draft.save();
            notify('Saved', 'success');
        } catch (caught) {
            fail(caught, 'Could not save');
        } finally {
            setBusy(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.save]);

    const doPublish = useCallback(async () => {
        setBusy(true);
        try {
            await draft.publish();
            notify('Published to the live site', 'success');
        } catch (caught) {
            fail(caught, 'Could not publish');
        } finally {
            setBusy(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.publish]);

    const handlePublish = useCallback(() => {
        const issues = validateForPublish(draft.frontmatter, draft.content);
        if (issues.length) setPublishIssues(issues);
        else doPublish();
    }, [draft.frontmatter, draft.content, doPublish]);

    const handleUnpublish = useCallback(async () => {
        setBusy(true);
        try {
            await draft.unpublish();
            notify('Moved back to drafts', 'success');
        } catch (caught) {
            fail(caught, 'Could not unpublish');
        } finally {
            setBusy(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.unpublish]);

    const togglePreview = useCallback(
        () => setMode((current) => (current === 'split' ? 'visual' : 'split')),
        []
    );

    useEditorShortcuts({
        onSave: handleSave,
        onPublish: handlePublish,
        onTogglePreview: togglePreview,
    });

    async function handleDuplicate() {
        if (!draft.id) return;
        setBusy(true);
        try {
            const { id: newId } = await articleAction(draft.id, 'duplicate');
            notify('Duplicated', 'success');
            router.push(editorHref(newId));
        } catch (caught) {
            fail(caught, 'Could not duplicate');
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (!draft.id) return;
        setConfirmingDelete(false);
        setBusy(true);
        try {
            await deleteArticle(draft.id);
            notify('Moved to trash', 'success');
            router.push('/admin/articles');
        } catch (caught) {
            fail(caught, 'Could not delete');
            setBusy(false);
        }
    }

    async function handleBack() {
        if (draft.dirty) {
            try {
                await draft.save();
            } catch {
                /* navigate anyway; warn the user */
            }
        }
        router.push('/admin/articles');
    }

    if (draft.loadState === 'loading') {
        return (
            <div className="flex min-h-[60vh] items-center justify-center gap-2 pt-24 text-sm text-foreground/50">
                <Spinner /> Loading editor...
            </div>
        );
    }

    if (draft.loadState === 'error') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 pt-24 text-center">
                <Icon name="callout" className="text-foreground/30 size-10" />
                <p className="text-foreground/70 text-sm">
                    {draft.loadError ?? 'Could not open this article.'}
                </p>
                <Button
                    variant="secondary"
                    onClick={() => router.push('/admin/articles')}
                >
                    <Icon name="arrow-left" className="size-4" />
                    Back to articles
                </Button>
            </div>
        );
    }

    const paneProps = {
        title: draft.frontmatter.title,
        onTitleChange: (title: string) => draft.setFrontmatter({ title }),
        slug: draft.slug,
        onOpenDetails: () => setDetailsOpen(true),
    };
    const markdownSurface = (
        <MarkdownEditor
            value={draft.content}
            onChange={draft.setContent}
            variant="raw"
            placeholder="Write Markdown here, or use Visual mode"
            className="min-h-0 flex-1"
        />
    );

    return (
        <div className="pt-16">
            <div className="flex h-[calc(100dvh-4rem)] min-w-0 flex-col overflow-x-hidden">
                <EditorTopBar
                    status={draft.status}
                    slug={draft.slug}
                    dirty={draft.dirty}
                    saveState={draft.saveState}
                    lastSavedAt={draft.lastSavedAt}
                    mode={mode}
                    onModeChange={setMode}
                    busy={busy}
                    onSave={handleSave}
                    onPublish={handlePublish}
                    onUnpublish={handleUnpublish}
                    onOpenDetails={() => setDetailsOpen(true)}
                    onDuplicate={handleDuplicate}
                    onDelete={() => setConfirmingDelete(true)}
                    onBack={handleBack}
                />

                <div className="min-h-0 min-w-0 flex-1">
                    {mode === 'split' ? (
                        <SplitView
                            left={
                                <EditorPane {...paneProps}>
                                    {markdownSurface}
                                </EditorPane>
                            }
                            right={
                                <LivePreview
                                    frontmatter={draft.frontmatter}
                                    content={draft.content}
                                    slug={draft.slug}
                                />
                            }
                        />
                    ) : (
                        <EditorPane {...paneProps}>
                            {mode === 'visual' ? (
                                <VisualEditor
                                    value={draft.content}
                                    onChange={draft.setContent}
                                />
                            ) : (
                                markdownSurface
                            )}
                        </EditorPane>
                    )}
                </div>
            </div>

            <FrontmatterDrawer
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                frontmatter={draft.frontmatter}
                setFrontmatter={draft.setFrontmatter}
                slug={draft.slug}
                setSlug={draft.setSlug}
                meta={meta}
                status={draft.status}
            />

            <ConfirmDialog
                open={confirmingDelete}
                title="Move to trash?"
                description="This article will be moved to content/article_trash. You can restore it from disk."
                confirmLabel="Move to trash"
                confirmVariant="danger"
                busy={busy}
                onConfirm={handleDelete}
                onCancel={() => setConfirmingDelete(false)}
            />

            <ConfirmDialog
                open={publishIssues !== null}
                title="Publish anyway?"
                description={`Before publishing, note that ${(publishIssues ?? []).join(', ')}.`}
                confirmLabel="Publish anyway"
                cancelLabel="Keep editing"
                busy={busy}
                onConfirm={() => {
                    setPublishIssues(null);
                    doPublish();
                }}
                onCancel={() => setPublishIssues(null)}
            />
        </div>
    );
}
