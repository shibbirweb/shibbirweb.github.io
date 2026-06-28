import Link from 'next/link';
import ArticleCover from '@/components/pages/articles/ArticleCover';
import TagLink from '@/components/pages/articles/TagLink';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';
import type { ArticleSummary } from '@/lib/posts';

export default function ArticleCard({
    article,
    compact = false,
}: {
    article: ArticleSummary;
    compact?: boolean;
}) {
    return (
        <li className="border-foreground/10 hover:border-foreground/30 relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg">
            {article.cover && (
                <ArticleCover
                    src={article.cover}
                    className="aspect-video"
                />
            )}
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
                    <p
                        className={cn(
                            'text-foreground/60',
                            compact ? 'text-sm' : 'text-base'
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
                                ? 'text-lg sm:text-xl'
                                : 'text-2xl sm:text-3xl'
                        )}
                    >
                        {article.title}
                    </h3>
                    <p
                        className={cn(
                            'text-foreground/70 mt-3 grow leading-normal',
                            compact ? 'text-base' : 'text-xl'
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
                                    ? 'px-2.5 py-0.5 text-sm'
                                    : 'px-3 py-1 text-base'
                            }
                        />
                    ))}
                </ul>
            </div>
        </li>
    );
}
