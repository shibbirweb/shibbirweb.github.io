import Link from 'next/link';
import ArticleCover from './ArticleCover';
import TagLink from './TagLink';
import { formatDate } from '@/utils/formatDate';
import type { ArticleSummary } from '@/lib/posts';

export default function ArticleCard({ article }: { article: ArticleSummary }) {
    return (
        <li className="border-foreground/10 hover:border-foreground/30 relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg">
            {article.cover && <ArticleCover src={article.cover} />}
            <div className="flex grow flex-col p-6 sm:p-8">
                {/* Stretched link: covers the whole card so any non-tag area
                    opens the article, while the tag links stay clickable. */}
                <Link
                    href={`/articles/${article.slug}`}
                    className="flex grow flex-col after:absolute after:inset-0 after:content-['']"
                >
                    <p className="text-foreground/60 text-base">
                        <time dateTime={article.date}>
                            {formatDate(article.date)}
                        </time>
                        {' · '}
                        {article.readingMinutes} min read
                    </p>
                    <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                        {article.title}
                    </h3>
                    <p className="text-foreground/70 mt-3 grow text-xl leading-normal">
                        {article.description}
                    </p>
                </Link>
                <ul className="relative z-10 mt-6 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                        <TagLink
                            key={tag}
                            tag={tag}
                            className="px-3 py-1 text-base"
                        />
                    ))}
                </ul>
            </div>
        </li>
    );
}
