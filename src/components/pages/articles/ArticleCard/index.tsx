import Link from 'next/link';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import ArticleCover from '@/components/pages/articles/ArticleCover';
import styles from '@/components/pages/articles/ArticleCard/ArticleCard.module.css';
import SeriesBadge from '@/components/pages/articles/ArticleCard/SeriesBadge';
import TagLink from '@/components/pages/articles/TagLink';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';
import type { ArticleSummary } from '@/lib/posts';
import type { CSSProperties } from 'react';

export default function ArticleCard({
    article,
    compact = false,
    seriesTotal,
}: {
    article: ArticleSummary;
    compact?: boolean;
    /** Published part count for this article's series, for the "of M" label. */
    seriesTotal?: number;
}) {
    // Tint the card to match its cover thumbnail; the glow itself fades in on
    // hover (see ArticleCard.module.css). The same two colours are exposed as the
    // accent custom properties so the series marker can pick up the card's
    // identity, matching the rest of the article UI (accentStyle).
    const coverColors = {
        '--cover-from': article.coverColors[0],
        '--cover-to': article.coverColors[1],
        ...accentStyle(article.coverColors),
    } as CSSProperties;

    return (
        <li
            {...spotlightSurfaceProps}
            style={coverColors}
            className={cn(
                styles.card,
                'border-foreground/10 hover:border-foreground/30 relative isolate flex h-full flex-col rounded-2xl border transition-all duration-300 hover:shadow-lg'
            )}
        >
            {/* The cover rounds its own top corners instead of the card clipping
                with overflow-hidden, which would swallow the lit border ring: the
                ring has to sit a pixel out to land on the card's real border rather
                than just inside it, where it would read as a second border. Its
                radius is the card's less the 1px border it sits inside. */}
            <ArticleCover
                src={article.cover}
                className="aspect-video rounded-t-[calc(1rem-1px)]"
            />
            <div
                className={cn(
                    'flex grow flex-col',
                    compact ? 'p-5' : 'p-6 sm:p-8'
                )}
            >
                {/* Stretched link: covers the whole card so any non-tag area
                    opens the article, while the tag links stay clickable. */}
                <Link
                    href={`/articles/${article.slug}`}
                    className="flex grow flex-col after:absolute after:inset-0 after:content-['']"
                >
                    {article.series && (
                        <SeriesBadge
                            order={article.series.order}
                            total={seriesTotal}
                            name={article.series.name}
                            compact={compact}
                        />
                    )}
                    <p
                        className={cn(
                            'text-foreground/70 tabular-nums',
                            compact ? 'text-xs' : 'text-sm'
                        )}
                    >
                        <time dateTime={article.date}>
                            {formatDate(article.date)}
                        </time>
                        {' · '}
                        {article.readingMinutes} min read
                    </p>
                    <h3
                        className={cn(
                            'mt-2 font-bold',
                            compact
                                ? 'text-base sm:text-lg'
                                : 'text-lg sm:text-xl'
                        )}
                    >
                        {article.title}
                    </h3>
                    <p
                        className={cn(
                            'text-foreground/70 mt-3 grow leading-relaxed',
                            compact ? 'text-sm' : 'text-base'
                        )}
                    >
                        {article.description}
                    </p>
                </Link>
                <ul
                    className={cn(
                        'relative z-10 flex flex-wrap gap-2',
                        compact ? 'mt-4' : 'mt-6'
                    )}
                >
                    {article.tags.map((tag) => (
                        <TagLink
                            key={tag}
                            tag={tag}
                            className={
                                compact
                                    ? 'px-2.5 py-0.5 text-xs'
                                    : 'px-3 py-1 text-sm'
                            }
                        />
                    ))}
                </ul>
            </div>

            <SpotlightBorder
                className={styles.spotlightBorder}
            />
        </li>
    );
}
