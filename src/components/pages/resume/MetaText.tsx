import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Right-aligned secondary text (location, dates, year). Monospace on screen to
 * match the site's terminal accents.
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
                'text-foreground/70 font-mono text-[11px]',
                className
            )}
        >
            {children}
        </span>
    );
}
