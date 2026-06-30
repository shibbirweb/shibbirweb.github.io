import { cn } from '@/utils/cn';
import type { ArticleStatus } from '@/lib/admin/types';

const STATUS_STYLES: Record<ArticleStatus, { label: string; className: string }> =
    {
        published: {
            label: 'Published',
            className:
                'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        },
        draft: {
            label: 'Draft',
            className:
                'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        },
        hidden: {
            label: 'Hidden',
            className:
                'bg-foreground/10 text-foreground/60 border-foreground/20',
        },
    };

/** A small coloured pill conveying an article's publication status. */
export default function StatusBadge({
    status,
    className,
}: {
    status: ArticleStatus;
    className?: string;
}) {
    const { label, className: tone } = STATUS_STYLES[status];
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                tone,
                className
            )}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}
