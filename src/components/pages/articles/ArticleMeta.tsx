import Link from 'next/link';
import DifficultyBadge from '@/components/pages/articles/DifficultyBadge';
import { siteAuthor } from '@/config/constants';
import { formatDate } from '@/utils/formatDate';
import type { ArticleDifficulty } from '@/lib/posts';

/**
 * The byline strip above the article title: difficulty, author, publish date,
 * reading time, and an "Updated" stamp when the post has been revised since
 * publishing. Each field is optional, so the row stays clean for sparse
 * frontmatter.
 *
 * The author link carries `rel="author"`, the on-page byline signal that browser
 * reading modes (Safari Reader, Firefox Reader View, Edge Immersive Reader) look
 * for, so their view of the article names who wrote it. The `<time datetime>`
 * values give them a machine-readable publish date for the same reason.
 */
export default function ArticleMeta({
    date,
    updated,
    readingMinutes,
    difficulty,
}: {
    date: string;
    updated?: string;
    readingMinutes: number;
    difficulty?: ArticleDifficulty;
}) {
    const wasUpdated = updated && updated !== date ? updated : null;

    return (
        <div className="text-foreground/70 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm tabular-nums">
            {difficulty && <DifficultyBadge level={difficulty} />}
            {/* One flex item, so on a narrow screen the whole run drops below the
                badge together instead of a line starting with a stray "·". */}
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span>
                    By{' '}
                    <Link
                        href="/#about"
                        rel="author"
                        className="focus-ring text-foreground/90 hover:text-foreground rounded-sm font-medium transition-colors"
                    >
                        {siteAuthor}
                    </Link>
                </span>
                <span aria-hidden>·</span>
                {date && <time dateTime={date}>{formatDate(date)}</time>}
                <span aria-hidden>·</span>
                <span>{readingMinutes} min read</span>
                {wasUpdated && (
                    <>
                        <span aria-hidden>·</span>
                        <span>
                            Updated{' '}
                            <time dateTime={wasUpdated}>
                                {formatDate(wasUpdated)}
                            </time>
                        </span>
                    </>
                )}
            </span>
        </div>
    );
}
