import { cn } from '@/utils/cn';

/** A switch control for boolean frontmatter fields. */
export default function Toggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none"
        >
            <span>
                <span className="block text-sm font-medium">{label}</span>
                {description && (
                    <span className="text-foreground/50 block text-xs">
                        {description}
                    </span>
                )}
            </span>
            <span
                className={cn(
                    'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                    checked ? 'bg-violet-600' : 'bg-foreground/20'
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 size-4 rounded-full bg-white transition-transform',
                        checked ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                />
            </span>
        </button>
    );
}
