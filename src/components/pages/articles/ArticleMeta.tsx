import DifficultyBadge from '@/components/pages/articles/DifficultyBadge';
import { formatDate } from '@/utils/formatDate';
import type { ArticleDifficulty } from '@/lib/posts';

/**
 * The byline strip above the article title: difficulty, publish date, reading
 * time, and an "Updated" stamp when the post has been revised since publishing.
 * Each field is optional, so the row stays clean for sparse frontmatter.
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
        </div>
    );
}
