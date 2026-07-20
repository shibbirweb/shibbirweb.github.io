import Link from 'next/link';
import ChevronIcon from '@/components/icons/chevron';
import { cn } from '@/utils/cn';
import type { ArticleSummary } from '@/lib/posts';

interface PagerLinkProps {
    article: ArticleSummary;
    direction: 'previous' | 'next';
    /** Pin to the right column and right-align (only when a previous card also
     *  occupies the left column, so a lone Next card stays left-aligned). */
    alignEnd?: boolean;
}

/** One pager card. "Next" carries a trailing arrow; "Previous" a leading one. */
function PagerLink({ article, direction, alignEnd = false }: PagerLinkProps) {
    const isNext = direction === 'next';
    return (
        <Link
            href={`/articles/${article.slug}`}
            rel={isNext ? 'next' : 'prev'}
            className={cn(
                'focus-ring border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02] group flex flex-col gap-2 rounded-xl border p-5 transition-colors',
                alignEnd ? 'sm:col-start-2 sm:items-end sm:text-right' : ''
            )}
        >
            <span className="text-foreground/70 flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase">
                {!isNext && (
                    <ChevronIcon className="size-3.5 -rotate-90 transition-transform group-hover:-translate-x-0.5" />
                )}
                {isNext ? 'Next' : 'Previous'}
                {isNext && (
                    <ChevronIcon className="size-3.5 rotate-90 transition-transform group-hover:translate-x-0.5" />
                )}
            </span>
            <span className="group-hover:text-foreground font-semibold transition-colors">
                {article.title}
            </span>
        </Link>
    );
}

/**
 * Previous/next navigation across the chronological feed, so a reader who
 * reaches the end of one article can keep going. Renders nothing when the
 * article has no neighbours (e.g. a lone post).
 */
export default function ArticlePager({
    previous,
    next,
}: {
    previous?: ArticleSummary;
    next?: ArticleSummary;
}) {
    if (!previous && !next) return null;

    return (
        <nav
            aria-label="More articles"
            className="mt-16 grid gap-4 sm:grid-cols-2"
        >
            {previous && (
                <PagerLink
                    article={previous}
                    direction="previous"
                />
            )}
            {next && (
                <PagerLink
                    article={next}
                    direction="next"
                    alignEnd={Boolean(previous)}
                />
            )}
        </nav>
    );
}
