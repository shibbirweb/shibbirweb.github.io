'use client';

import Search from '@/components/icons/search';
import { jetBrainsMono } from '@/config/monoFont';
import { useIsMac } from '@/components/pages/articles/ArticleSearch/hooks/useIsMac';
import { cn } from '@/utils/cn';

const keycap =
    'border-foreground/15 bg-foreground/[0.04] text-foreground/70 group-hover:border-foreground/30 group-hover:text-foreground/80 inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-b-2 px-1 font-mono text-[0.7rem] leading-none transition-colors';

/**
 * The search affordance on the articles pages: a button that opens the search
 * modal. The keyboard shortcut sits beside the icon as mono keycaps (matching
 * the terminal-path breadcrumb), separated by a divider so the icon and shortcut
 * read as one designed control. Collapses to an icon-only key on small screens,
 * where the shortcut is not useful.
 */
export default function SearchTrigger({
    onClick,
    className,
}: {
    onClick: () => void;
    className?: string;
}) {
    const keys = useIsMac() ? ['⌘', 'K'] : ['Ctrl', 'K'];

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Search articles"
            aria-keyshortcuts="Control+K Meta+K"
            title="Search articles"
            className={cn(
                jetBrainsMono.variable,
                'group border-foreground/15 text-foreground/70 hover:border-foreground/40 hover:text-foreground hover:bg-foreground/[0.04] inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border transition-colors sm:w-auto sm:justify-start sm:gap-2.5 sm:pr-2.5 sm:pl-3',
                className
            )}
        >
            <Search className="size-5 shrink-0" />
            <span
                aria-hidden="true"
                className="border-foreground/10 hidden items-center gap-1 border-l pl-2.5 sm:flex"
            >
                {keys.map((key) => (
                    <kbd
                        key={key}
                        className={keycap}
                    >
                        {key}
                    </kbd>
                ))}
            </span>
        </button>
    );
}
