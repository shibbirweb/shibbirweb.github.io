import ChevronIcon from '@/components/icons/chevron';
import SlidersIcon from '@/components/icons/sliders';
import { cn } from '@/utils/cn';

/** Opens and closes the topic panel. Shows "1" while a topic is applied. */
export default function FiltersButton({
    isOpen,
    hasActiveFilter,
    panelId,
    onToggle,
}: {
    isOpen: boolean;
    hasActiveFilter: boolean;
    panelId: string;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={hasActiveFilter ? 'Filters, 1 applied' : 'Filters'}
            onClick={onToggle}
            className={cn(
                'focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors sm:min-h-9',
                isOpen
                    ? 'border-foreground/50 text-foreground'
                    : 'border-foreground/15 text-foreground/75 hover:border-foreground/50 hover:text-foreground'
            )}
        >
            <SlidersIcon
                aria-hidden
                className="size-4"
            />
            Filters
            {hasActiveFilter && (
                <span className="bg-foreground text-background flex size-5 items-center justify-center rounded-full text-[0.7rem] font-semibold">
                    1
                </span>
            )}
            <ChevronIcon
                aria-hidden
                className={cn(
                    'size-4 transition-transform',
                    isOpen ? 'rotate-0' : 'rotate-180'
                )}
            />
        </button>
    );
}
