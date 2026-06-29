import Link from 'next/link';
import { cn } from '@/utils/cn';

/**
 * Condensed page list: the first and last pages always show, along with the
 * current page and its immediate neighbours; gaps collapse to an ellipsis.
 * Seven or fewer pages show every number.
 */
function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }
    const items: (number | 'ellipsis')[] = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) items.push('ellipsis');
    for (let page = left; page <= right; page++) items.push(page);
    if (right < total - 1) items.push('ellipsis');
    items.push(total);
    return items;
}

interface PaginationProps {
    current: number;
    total: number;
    /** Builds the href for a page number, preserving the active query params. */
    createHref: (page: number) => string;
}

const itemBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm transition-colors';
const itemInactive =
    'border-foreground/15 text-foreground/70 hover:text-foreground hover:bg-foreground/5';

export default function Pagination({
    current,
    total,
    createHref,
}: PaginationProps) {
    if (total <= 1) return null;
    const items = getPageItems(current, total);

    return (
        <nav
            aria-label="Article pages"
            className="mt-14 flex flex-wrap items-center justify-center gap-2"
        >
            {current > 1 && (
                <Link
                    href={createHref(current - 1)}
                    rel="prev"
                    className={cn(itemBase, itemInactive)}
                >
                    Prev
                </Link>
            )}
            {items.map((item, index) =>
                item === 'ellipsis' ? (
                    <span
                        key={`ellipsis-${index}`}
                        aria-hidden="true"
                        className={cn(
                            itemBase,
                            'text-foreground/40 border-transparent'
                        )}
                    >
                        …
                    </span>
                ) : (
                    <Link
                        key={item}
                        href={createHref(item)}
                        aria-current={item === current ? 'page' : undefined}
                        className={cn(
                            itemBase,
                            item === current
                                ? 'border-foreground bg-foreground text-background font-semibold'
                                : itemInactive
                        )}
                    >
                        {item}
                    </Link>
                )
            )}
            {current < total && (
                <Link
                    href={createHref(current + 1)}
                    rel="next"
                    className={cn(itemBase, itemInactive)}
                >
                    Next
                </Link>
            )}
        </nav>
    );
}
