import Link from 'next/link';
import Tag from '@/components/pages/common/Tag';
import { formatDate } from '@/utils/formatDate';
import type { ArticleSummary } from '@/lib/posts';

export default function ArticleCard({ article }: { article: ArticleSummary }) {
    return (
        <li>
            <Link
                href={`/articles/${article.slug}`}
                className="border-foreground/10 hover:border-foreground/30 flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg sm:p-8"
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
                <ul className="mt-6 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                        <Tag
                            key={tag}
                            className="text-foreground/70 px-3 py-1 text-base"
                        >
                            {tag}
                        </Tag>
                    ))}
                </ul>
            </Link>
        </li>
    );
}
