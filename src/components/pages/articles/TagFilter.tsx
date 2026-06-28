import Link from 'next/link';
import { cn } from '@/utils/cn';

const base =
    'inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors';
const inactive =
    'border-foreground/15 text-foreground/70 hover:border-foreground/50 hover:text-foreground';
const activeClasses = 'border-foreground bg-foreground text-background';

/**
 * Tag filter bar shown above the articles list. Presentational: the active tag
 * is passed in, so it renders both server-side (fallback) and client-side.
 */
export default function TagFilter({
    tags,
    active,
}: {
    tags: string[];
    active: string | null;
}) {
    if (tags.length === 0) return null;
    return (
        <nav
            aria-label="Filter articles by tag"
            className="mt-10 flex flex-wrap gap-2"
        >
            <Link
                href="/articles"
                className={cn(base, active ? inactive : activeClasses)}
            >
                All
            </Link>
            {tags.map((tag) => (
                <Link
                    key={tag}
                    href={`/articles?tag=${encodeURIComponent(tag)}`}
                    aria-current={active === tag ? 'page' : undefined}
                    className={cn(
                        base,
                        active === tag ? activeClasses : inactive
                    )}
                >
                    {tag}
                </Link>
            ))}
        </nav>
    );
}
