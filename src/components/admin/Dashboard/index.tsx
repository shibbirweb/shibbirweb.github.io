'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useArticles } from '@/components/admin/Dashboard/hooks/useArticles';
import { selectArticles } from '@/components/admin/Dashboard/select';
import { editorHref } from '@/components/admin/Dashboard/links';
import DashboardToolbar from '@/components/admin/Dashboard/DashboardToolbar';
import BulkBar from '@/components/admin/Dashboard/BulkBar';
import ArticleRow from '@/components/admin/Dashboard/ArticleRow';
import ArticleGridCard from '@/components/admin/Dashboard/ArticleGridCard';
import EmptyState from '@/components/admin/Dashboard/EmptyState';
import ErrorState from '@/components/admin/Dashboard/ErrorState';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import Spinner from '@/components/admin/ui/Spinner';
import { useToast } from '@/components/admin/ui/Toast';
import {
    articleAction,
    createArticle,
    deleteArticle,
} from '@/components/admin/api';
import {
    DEFAULT_FILTERS,
    type DashboardFilters,
    type ViewMode,
} from '@/components/admin/Dashboard/types';
import type { ArticleListItem } from '@/lib/admin/types';

interface DeleteTarget {
    ids: string[];
    label: string;
}

export default function ArticlesDashboard() {
    const router = useRouter();
    const notify = useToast();
    const { articles, meta, loading, error, reload } = useArticles();

    const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
    const [view, setView] = useState<ViewMode>('list');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [creating, setCreating] = useState(false);
    const [busy, setBusy] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

    const visible = useMemo(
        () => selectArticles(articles, filters),
        [articles, filters]
    );
    const counts = useMemo(
        () => ({
            total: articles.length,
            published: articles.filter((a) => a.status === 'published').length,
            draft: articles.filter((a) => a.status === 'draft').length,
        }),
        [articles]
    );

    const patchFilters = (patch: Partial<DashboardFilters>) =>
        setFilters((current) => ({ ...current, ...patch }));

    const toggleSelect = (id: string) =>
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const allVisibleSelected =
        visible.length > 0 && visible.every((item) => selected.has(item.id));

    const toggleSelectAll = () =>
        setSelected(
            allVisibleSelected
                ? new Set()
                : new Set(visible.map((item) => item.id))
        );

    const clearSelection = () => setSelected(new Set());

    async function handleCreate() {
        setCreating(true);
        try {
            const { id } = await createArticle();
            notify('Draft created', 'success');
            router.push(editorHref(id));
        } catch (caught) {
            notify(message(caught, 'Could not create article'), 'error');
            setCreating(false);
        }
    }

    async function runAction(
        ids: string[],
        run: (id: string) => Promise<unknown>,
        successText: string
    ) {
        setBusy(true);
        try {
            await Promise.all(ids.map(run));
            notify(successText, 'success');
            clearSelection();
            await reload();
        } catch (caught) {
            notify(message(caught, 'Action failed'), 'error');
        } finally {
            setBusy(false);
        }
    }

    const duplicate = (item: ArticleListItem) =>
        runAction([item.id], (id) => articleAction(id, 'duplicate'), 'Duplicated');
    const publish = (ids: string[]) =>
        runAction(ids, (id) => articleAction(id, 'publish'), 'Published');
    const unpublish = (ids: string[]) =>
        runAction(ids, (id) => articleAction(id, 'unpublish'), 'Moved to drafts');

    async function confirmDelete() {
        if (!deleteTarget) return;
        const { ids } = deleteTarget;
        setDeleteTarget(null);
        await runAction(ids, deleteArticle, 'Moved to trash');
    }

    const rowHandlers = (item: ArticleListItem) => ({
        selected: selected.has(item.id),
        onToggleSelect: () => toggleSelect(item.id),
        onEdit: () => router.push(editorHref(item.id)),
        onDuplicate: () => duplicate(item),
        onPublish: () => publish([item.id]),
        onUnpublish: () => unpublish([item.id]),
        onDelete: () =>
            setDeleteTarget({ ids: [item.id], label: `"${item.title}"` }),
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Articles</h1>
                    <p className="text-foreground/55 mt-1 text-sm">
                        {counts.total} total · {counts.published} published ·{' '}
                        {counts.draft} draft{counts.draft === 1 ? '' : 's'}
                    </p>
                </div>
            </div>

            <DashboardToolbar
                filters={filters}
                onChange={patchFilters}
                meta={meta}
                view={view}
                onViewChange={setView}
                onCreate={handleCreate}
                creating={creating}
            />

            {selected.size > 0 && (
                <BulkBar
                    count={selected.size}
                    busy={busy}
                    onPublish={() => publish([...selected])}
                    onUnpublish={() => unpublish([...selected])}
                    onDelete={() =>
                        setDeleteTarget({
                            ids: [...selected],
                            label: `${selected.size} articles`,
                        })
                    }
                    onClear={clearSelection}
                />
            )}

            {loading ? (
                <div className="text-foreground/50 flex items-center justify-center gap-2 py-24 text-sm">
                    <Spinner /> Loading articles...
                </div>
            ) : error ? (
                <ErrorState message={error} onRetry={reload} />
            ) : visible.length === 0 ? (
                <EmptyState
                    hasArticles={articles.length > 0}
                    onCreate={handleCreate}
                />
            ) : view === 'list' ? (
                <div className="border-foreground/10 overflow-hidden rounded-2xl border">
                    <div className="border-foreground/10 bg-foreground/[0.02] flex items-center gap-3 border-b px-3 py-2.5 sm:gap-4">
                        <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                            aria-label="Select all"
                            className="size-4 cursor-pointer accent-violet-600"
                        />
                        <span className="text-foreground/50 text-xs font-semibold tracking-wide uppercase">
                            {visible.length} article
                            {visible.length === 1 ? '' : 's'}
                        </span>
                    </div>
                    <div className="divide-foreground/10 divide-y">
                        {visible.map((item) => (
                            <ArticleRow
                                key={item.id}
                                item={item}
                                {...rowHandlers(item)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((item) => (
                        <ArticleGridCard
                            key={item.id}
                            item={item}
                            {...rowHandlers(item)}
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Move to trash?"
                description={`${deleteTarget?.label ?? ''} will be moved to content/article_trash. You can restore it from disk.`}
                confirmLabel="Move to trash"
                confirmVariant="danger"
                busy={busy}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

function message(caught: unknown, fallback: string): string {
    return caught instanceof Error ? caught.message : fallback;
}
