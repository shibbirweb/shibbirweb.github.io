import Link from 'next/link';
import ArticleCard from '@/components/pages/articles/ArticleCard';
import SectionHeading from '@/components/pages/common/SectionHeading';
import { getLatestArticles } from '@/lib/posts';

export default function ArticlesArea() {
    const latest = getLatestArticles(3);
    if (latest.length === 0) return null;

    return (
        <section
            id="articles"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto px-4">
                <SectionHeading accentClassName="decoration-emerald-500">
                    Latest Articles
                </SectionHeading>
                <p className="text-foreground/70 mt-6 max-w-3xl text-2xl leading-normal">
                    Writing on backend engineering, AI, and self-hosted
                    infrastructure.
                </p>

                <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {latest.map((article) => (
                        <ArticleCard
                            key={article.slug}
                            article={article}
                        />
                    ))}
                </ul>

                <div className="mt-10">
                    <Link
                        href="/articles"
                        className="border-foreground/20 hover:border-foreground/50 inline-block rounded-full border px-8 py-3 text-xl transition-all duration-300 hover:scale-105"
                    >
                        View all articles
                    </Link>
                </div>
            </div>
        </section>
    );
}
