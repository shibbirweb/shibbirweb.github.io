import Link from 'next/link';
import ChevronIcon from '@/components/icons/chevron';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import styles from '@/components/pages/articles/ArticlePager/PagerLink.module.css';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import type { ArticleSummary } from '@/lib/posts';

/**
 * One pager card. "Next" carries a trailing arrow; "Previous" a leading one. The
 * card is lit by the accent of the article it points at (its cover colours), so the
 * glow previews the destination, matching how an article card matches its own cover.
 */
export default function PagerLink({
    article,
    direction,
    alignEnd = false,
}: {
    article: ArticleSummary;
    direction: 'previous' | 'next';
    /** Pin to the right column and right-align (only when a previous card also
     *  occupies the left column, so a lone Next card stays left-aligned). */
    alignEnd?: boolean;
}) {
    const isNext = direction === 'next';
    return (
        <Link
            {...spotlightSurfaceProps}
            href={`/articles/${article.slug}`}
            rel={isNext ? 'next' : 'prev'}
            style={accentStyle(article.coverColors)}
            className={cn(
                styles.card,
                'focus-ring border-foreground/10 hover:border-foreground/30 group relative isolate flex flex-col gap-2 rounded-xl border p-5 transition-colors',
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

            <SpotlightBorder className={styles.spotlightBorder} />
        </Link>
    );
}
