import { cn } from '@/utils/cn';
import { HTMLAttributes } from 'react';

/**
 * Pill tag — a small reusable primitive. Used for project tech chips and
 * skill chips. Pass size/colour via `className`; rendered as an <li> so it
 * lives inside a <ul>.
 */
export default function Tag({
    children,
    className,
    ...rest
}: HTMLAttributes<HTMLLIElement>) {
    return (
        <li
            className={cn(
                'rounded-full border border-foreground/15 transition-colors',
                className
            )}
            {...rest}
        >
            {children}
        </li>
    );
}
