import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadPreviewArticle } from '@/app/studio/article-editor/preview/[slug]/loader.dev';
import ArticleView from '@/components/pages/articles/ArticleView';
import {
    getAdjacentArticles,
    getRelatedArticles,
    getSeriesForArticle,
} from '@/lib/posts';

// Dev-only route (the .dev.tsx extension keeps it out of the export build), so the
// dynamic [slug] needs no generateStaticParams. Living under app/, it inherits the
// root layout (navbar/footer), so the preview matches production exactly. Related /
// series / adjacent are computed against the published corpus; a draft simply has
// none of those yet.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function ArticlePreviewPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = await loadPreviewArticle(slug);
    if (!article) notFound();

    const related = getRelatedArticles(slug, 3);
    const series = getSeriesForArticle(slug);
    const { previous, next } = getAdjacentArticles(slug);

    return (
        <ArticleView
            article={article}
            related={related}
            series={series}
            previous={previous}
            next={next}
        />
    );
}
