import Link from 'next/link';
import ChevronIcon from '@/components/icons/chevron';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import ArticleRowMeta from '@/components/pages/articles/ArticleRow/ArticleRowMeta';
import ArticleRowTags from '@/components/pages/articles/ArticleRow/ArticleRowTags';
import DateTile from '@/components/pages/articles/ArticleRow/DateTile';
import styles from '@/components/pages/articles/ArticleRow/ArticleRow.module.css';
import { seriesPartLabel } from '@/components/pages/articles/ArticleRow/seriesPartLabel';
import { cn } from '@/utils/cn';
import type { ArticleSummary } from '@/lib/posts';
import type { CSSProperties } from 'react';

/**
 * One compact "journal index" row (home Latest Articles, articles list view): a
 * calendar tile in the cover colours, a mono kicker, the title, a two-line
 * description, a few `#tag` links, and an arrow on wider screens. The whole row
 * is one stretched link to the article; the tag links sit above it.
 */
export default function ArticleRow({
    article,
    seriesTotal,
}: {
    article: ArticleSummary;
    /** Published part count for this article's series, for the "of M" label. */
    seriesTotal?: number;
}) {
    const coverColors = {
        '--cover-from': article.coverColors[0],
        '--cover-to': article.coverColors[1],
    } as CSSProperties;

    return (
        <li
            {...spotlightSurfaceProps}
            style={coverColors}
            className={cn(
                styles.row,
                'border-foreground/10 hover:border-foreground/25 relative isolate flex items-start gap-4 rounded-xl border p-3 transition-colors duration-300 sm:gap-5 sm:p-4'
            )}
        >
            <DateTile date={article.date} />

            <div className="min-w-0 grow">
                <Link
                    href={`/articles/${article.slug}`}
                    className="focus-ring block rounded-sm after:absolute after:inset-0 after:content-['']"
                >
                    <ArticleRowMeta
                        label={article.category ?? article.tags[0]}
                        readingMinutes={article.readingMinutes}
                        seriesPart={seriesPartLabel(
                            article.series,
                            seriesTotal
                        )}
                    />
                    <h3 className="mt-1.5 text-base leading-snug font-bold sm:text-lg">
                        {article.title}
                    </h3>
                    <p className="text-foreground/70 mt-1 line-clamp-2 text-sm leading-relaxed">
                        {article.description}
                    </p>
                </Link>
                <ArticleRowTags tags={article.tags} />
            </div>

            <ChevronIcon
                aria-hidden
                className={cn(
                    styles.arrow,
                    'hidden size-5 shrink-0 rotate-90 self-center sm:block'
                )}
            />

            <SpotlightBorder className={styles.spotlightBorder} />
        </li>
    );
}
