import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { BreadcrumbItem as BreadcrumbItemData } from '@/components/layout/Breadcrumb/types';

interface BreadcrumbItemProps {
    item: BreadcrumbItemData;
    /** The last crumb is the current page: rendered as plain, brighter text. */
    isCurrent: boolean;
}

export default function BreadcrumbItem({ item, isCurrent }: BreadcrumbItemProps) {
    if (isCurrent) {
        return (
            <span
                aria-current="page"
                className="text-foreground/90"
            >
                {item.label}
            </span>
        );
    }

    return (
        <Link
            href={item.href}
            aria-label={item.name ?? item.label}
            className={cn(
                'focus-ring hover:text-foreground rounded-sm transition-colors motion-reduce:transition-none'
            )}
        >
            {item.label}
        </Link>
    );
}
