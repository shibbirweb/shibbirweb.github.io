import Link from 'next/link';
import CloseIcon from '@/components/icons/close';
import { cn } from '@/utils/cn';

/**
 * The way out of a search: a small chip back to every article on /articles,
 * shown beside the results count.
 */
export default function ClearSearchLink({ className }: { className?: string }) {
    return (
        <Link
            href="/articles"
            className={cn(
                'focus-ring border-foreground/15 text-foreground/75 hover:border-foreground/50 hover:text-foreground inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors sm:min-h-9',
                className
            )}
        >
            Clear search
            <CloseIcon
                aria-hidden
                className="size-3.5"
            />
        </Link>
    );
}
