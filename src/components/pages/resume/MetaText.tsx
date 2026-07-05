import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Right-aligned secondary text (location, dates, year). Monospace on screen to
 * match the site's terminal accents; switches to the document's sans in print.
 */
export default function MetaText({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'text-foreground/50 font-mono text-[11px] print:font-[Helvetica,Arial,sans-serif] print:text-[9pt] print:text-black/70',
                className
            )}
        >
            {children}
        </span>
    );
}
