'use client';

import Search from '@/components/icons/search';
import { useIsMac } from '@/components/pages/articles/ArticleSearch/hooks/useIsMac';
import { cn } from '@/utils/cn';

/**
 * The search affordance shown on the articles pages: a button that opens the
 * search modal, with its keyboard shortcut shown beside the icon (Cmd+K on
 * macOS, Ctrl+K elsewhere). Collapses to an icon-only circle on small screens,
 * where the shortcut hint is not useful.
 */
export default function SearchTrigger({
    onClick,
    className,
}: {
    onClick: () => void;
    className?: string;
}) {
    const shortcut = useIsMac() ? '⌘K' : 'Ctrl K';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Search articles"
            aria-keyshortcuts="Control+K Meta+K"
            title={`Search articles (${shortcut})`}
            className={cn(
                'group border-foreground/15 text-foreground/60 hover:border-foreground/40 hover:text-foreground hover:bg-foreground/5 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition-colors sm:w-auto sm:justify-start sm:gap-2 sm:pr-2 sm:pl-3.5',
                className
            )}
        >
            <Search className="size-5 shrink-0" />
            <kbd className="border-foreground/20 text-foreground/50 group-hover:text-foreground/70 hidden rounded-md border px-1.5 py-0.5 text-xs font-medium transition-colors sm:inline-block">
                {shortcut}
            </kbd>
        </button>
    );
}
