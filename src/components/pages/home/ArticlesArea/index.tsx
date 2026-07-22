import Link from 'next/link';
import ArticleCard from '@/components/pages/articles/ArticleCard';
import SectionHeading from '@/components/pages/common/SectionHeading';
import { buildSeriesTotals } from '@/utils/seriesTotals';
import { getAllArticles, getLatestArticles } from '@/lib/posts';

export default function ArticlesArea() {
    const latest = getLatestArticles(3);
    if (latest.length === 0) return null;

    // Totals come from the whole corpus so a teased part still reads "of M".
    const seriesTotals = buildSeriesTotals(getAllArticles());

    return (
        <section
            id="articles"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto px-4">
                <SectionHeading className="text-center">
                    Latest Articles
                </SectionHeading>

                <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {latest.map((article) => (
                        <ArticleCard
                            key={article.slug}
                            article={article}
                            seriesTotal={
                                article.series
                                    ? seriesTotals[article.series.name]
                                    : undefined
                            }
                        />
                    ))}
                </ul>

                <div className="mt-10">
                    <Link
                        href="/articles"
                        className="border-foreground/20 hover:border-foreground/50 inline-block rounded-full border px-6 py-2.5 text-sm transition-[transform,border-color] duration-300 motion-safe:hover:scale-105"
                    >
                        View all articles
                    </Link>
                </div>
            </div>
        </section>
    );
}
