'use client';

import Link from 'next/link';
import Button from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import Menu, { MenuItem } from '@/components/admin/ui/Menu';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import SaveIndicator from '@/components/admin/Editor/SaveIndicator';
import { EDITOR_MODES, type EditorMode } from '@/components/admin/Editor/mode';
import { cn } from '@/utils/cn';
import type { SaveState } from '@/components/admin/Editor/hooks/useArticleDraft';
import type { ArticleStatus } from '@/lib/admin/types';

/** The editor's command bar: a 3-zone grid of status, mode switch, and actions. */
export default function EditorTopBar({
    status,
    slug,
    dirty,
    saveState,
    lastSavedAt,
    mode,
    onModeChange,
    busy,
    onSave,
    onPublish,
    onUnpublish,
    onOpenDetails,
    onDuplicate,
    onDelete,
    onBack,
}: {
    status: ArticleStatus;
    slug: string;
    dirty: boolean;
    saveState: SaveState;
    lastSavedAt: number | null;
    mode: EditorMode;
    onModeChange: (mode: EditorMode) => void;
    busy: boolean;
    onSave: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onOpenDetails: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onBack: () => void;
}) {
    const published = status === 'published';

    return (
        <div className="border-foreground/10 bg-background/85 relative z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-foreground/60 hover:bg-foreground/10 hover:text-foreground flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
                >
                    <Icon name="arrow-left" className="size-4" />
                    <span className="hidden sm:inline">Articles</span>
                </button>
                <div className="bg-foreground/10 hidden h-5 w-px shrink-0 lg:block" />
                <StatusBadge status={status} className="hidden shrink-0 lg:inline-flex" />
                <div className="hidden min-w-0 lg:block">
                    <SaveIndicator
                        dirty={dirty}
                        saveState={saveState}
                        lastSavedAt={lastSavedAt}
                        onRetry={onSave}
                    />
                </div>
            </div>

            <div className="border-foreground/15 flex items-center rounded-lg border p-0.5">
                {EDITOR_MODES.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onModeChange(option.id)}
                        aria-pressed={mode === option.id}
                        className={cn(
                            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none',
                            mode === option.id
                                ? 'bg-foreground/10 text-foreground'
                                : 'text-foreground/50 hover:text-foreground'
                        )}
                    >
                        <Icon name={option.icon} className="size-4" />
                        <span className="hidden sm:inline">{option.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                <Button variant="secondary" size="sm" onClick={onOpenDetails}>
                    <Icon name="settings" className="size-4" />
                    <span className="hidden md:inline">Details</span>
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSave}
                    disabled={busy || saveState === 'saving'}
                >
                    <Icon name="save" className="size-4" />
                    <span className="hidden md:inline">Save</span>
                </Button>
                {published ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onUnpublish}
                        disabled={busy}
                    >
                        <Icon name="unpublish" className="size-4" />
                        <span className="hidden sm:inline">Unpublish</span>
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onPublish}
                        disabled={busy}
                    >
                        <Icon name="publish" className="size-4" />
                        <span className="hidden sm:inline">Publish</span>
                    </Button>
                )}
                <Menu label="More actions">
                    {published && (
                        <Link
                            href={`/articles/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            tabIndex={-1}
                            className="text-foreground/80 hover:bg-foreground/[0.07] focus-visible:bg-foreground/[0.07] hover:text-foreground flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm focus-visible:outline-none"
                        >
                            <Icon name="external" className="size-4" />
                            View live
                        </Link>
                    )}
                    <MenuItem icon="copy" onClick={onDuplicate}>
                        Duplicate
                    </MenuItem>
                    <MenuItem icon="trash" danger onClick={onDelete}>
                        Delete
                    </MenuItem>
                </Menu>
            </div>
        </div>
    );
}
