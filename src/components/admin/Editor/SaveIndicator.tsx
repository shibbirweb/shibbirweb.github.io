'use client';

import Icon from '@/components/admin/ui/Icon';
import Spinner from '@/components/admin/ui/Spinner';
import { useNow } from '@/components/admin/Editor/hooks/useNow';
import { timeAgo } from '@/utils/timeAgo';
import type { SaveState } from '@/components/admin/Editor/hooks/useArticleDraft';

/** The autosave status, mirroring the issue's "Saved 2 seconds ago" example. */
export default function SaveIndicator({
    dirty,
    saveState,
    lastSavedAt,
    onRetry,
}: {
    dirty: boolean;
    saveState: SaveState;
    lastSavedAt: number | null;
    onRetry: () => void;
}) {
    const now = useNow(5000);

    if (saveState === 'saving') {
        return (
            <span className="text-foreground/50 flex items-center gap-1.5 text-xs">
                <Spinner className="size-3" /> Saving...
            </span>
        );
    }
    if (saveState === 'error') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-red-500">
                <Icon name="close" className="size-3.5" /> Save failed
                <button
                    type="button"
                    onClick={onRetry}
                    className="rounded font-semibold underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
                >
                    Retry
                </button>
            </span>
        );
    }
    if (dirty) {
        return (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span className="size-1.5 rounded-full bg-current" /> Unsaved
                changes
            </span>
        );
    }
    if (lastSavedAt) {
        return (
            <span className="text-foreground/50 flex items-center gap-1.5 text-xs">
                <Icon name="check" className="size-3.5 text-emerald-500" /> Saved{' '}
                {timeAgo(new Date(lastSavedAt).toISOString(), now)}
            </span>
        );
    }
    return null;
}
