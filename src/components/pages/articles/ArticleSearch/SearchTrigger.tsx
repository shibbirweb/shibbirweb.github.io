import Search from '@/components/icons/search';
import { cn } from '@/utils/cn';

/**
 * The search affordance shown on the articles pages: a single icon button that
 * opens the search modal. Also reachable via the Cmd/Ctrl+K shortcut.
 */
export default function SearchTrigger({
    onClick,
    className,
}: {
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Search articles"
            aria-keyshortcuts="Control+K Meta+K"
            title="Search articles"
            className={cn(
                'border-foreground/15 text-foreground/60 hover:border-foreground/40 hover:text-foreground hover:bg-foreground/5 grid size-11 cursor-pointer place-items-center rounded-full border transition-colors',
                className
            )}
        >
            <Search className="size-5" />
        </button>
    );
}
