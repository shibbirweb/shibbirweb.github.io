import ArticleCard from './ArticleCard';
import type { ArticleSummary } from '@/lib/posts';

export default function ArticleGrid({
    articles,
}: {
    articles: ArticleSummary[];
}) {
    return (
        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {articles.map((article) => (
                <ArticleCard
                    key={article.slug}
                    article={article}
                />
            ))}
        </ul>
    );
}
