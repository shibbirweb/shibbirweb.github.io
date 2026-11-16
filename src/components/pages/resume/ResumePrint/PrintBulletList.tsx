import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

/** Disc list with dark markers, used for highlights and bullet sections. */
export default function PrintBulletList({
    items,
    className,
}: {
    items: ReactNode[];
    className?: string;
}) {
    return (
        <ul
            className={cn(
                'list-disc pl-[1.15em] marker:text-neutral-900',
                className
            )}
        >
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
}
