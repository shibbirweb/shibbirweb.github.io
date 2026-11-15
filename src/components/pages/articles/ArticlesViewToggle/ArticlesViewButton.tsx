import type { ArticlesViewOption } from '@/components/pages/articles/ArticlesViewToggle/contents';
import { cn } from '@/utils/cn';

/** One segment of the layout toggle: an icon button that reports if it is on. */
export default function ArticlesViewButton({
    option,
    pressed,
    onSelect,
}: {
    option: ArticlesViewOption;
    pressed: boolean;
    onSelect: () => void;
}) {
    const { Icon, label } = option;

    return (
        <button
            type="button"
            aria-pressed={pressed}
            aria-label={label}
            title={label}
            onClick={onSelect}
            className={cn(
                'focus-ring inline-flex size-9 items-center justify-center rounded-full transition-colors',
                pressed
                    ? 'bg-foreground text-background'
                    : 'text-foreground/60 hover:text-foreground'
            )}
        >
            <Icon
                aria-hidden
                className="size-4"
            />
        </button>
    );
}
