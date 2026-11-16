import SectionHeading from '@/components/pages/common/SectionHeading';
import ButtonLink from '@/components/ui/ButtonLink';
import ArticleRowList from '@/components/pages/articles/ArticleRowList';
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
            <div className="container mx-auto max-w-4xl px-4">
                <SectionHeading className="text-center">
                    Latest Articles
                </SectionHeading>

                <ArticleRowList
                    articles={latest}
                    seriesTotals={seriesTotals}
                    className="mt-10"
                />

                <div className="mt-8 text-center">
                    <ButtonLink
                        href="/articles"
                        variant="outline"
                        className="rounded-full"
                    >
                        View all articles
                    </ButtonLink>
                </div>
            </div>
        </section>
    );
}
