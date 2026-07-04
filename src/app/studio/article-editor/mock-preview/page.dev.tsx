import Breadcrumb from '@/components/layout/Breadcrumb';
import ArticleContent from '@/components/pages/articles/ArticleContent';
import ArticleCover from '@/components/pages/articles/ArticleCover';
import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import ArticleMeta from '@/components/pages/articles/ArticleMeta';
import ArticlePager from '@/components/pages/articles/ArticlePager';
import CodeBlockCopy from '@/components/pages/articles/CodeBlock';
import ImageLightbox from '@/components/pages/articles/ImageLightbox';
import MermaidRenderer from '@/components/pages/articles/MermaidRenderer';
import ReadingProgress from '@/components/pages/articles/ReadingProgress';
import SeriesNav from '@/components/pages/articles/SeriesNav';
import TableOfContents from '@/components/pages/articles/TableOfContents';
import MobileTableOfContents from '@/components/pages/articles/TableOfContents/MobileTableOfContents';
import TagLink from '@/components/pages/articles/TagLink';
import TechStack from '@/components/pages/articles/TechStack';
import WhatYoullLearn from '@/components/pages/articles/WhatYoullLearn';
import { SAMPLE_DRAFT } from '@/components/pages/article-editor/ArticleEditor/mockData';
import { jetBrainsMono } from '@/config/monoFont';
import { renderMarkdown } from '@/lib/markdown';
import { getLatestArticles, type ArticleSeries } from '@/lib/posts';
import { cn } from '@/utils/cn';

const MOCK_ACCENT_COLORS = ['#2563eb', '#7c3aed'] as const;

/** A resolved multi-part series built from the sample's frontmatter series. */
function mockSeries(
    name: string,
    order: number,
    currentTitle: string
): ArticleSeries {
    const others = [
        { slug: 'series-part-foundations', title: 'Laying the Foundations' },
        { slug: 'series-part-retrieval', title: 'Indexing and Retrieval' },
        { slug: 'series-part-scale', title: 'Serving Answers at Scale' },
    ];
    const parts = [
        {
            slug: 'series-part-current',
            title: currentTitle,
            order,
            isCurrent: true,
        },
        ...others.map((part, index) => ({
            ...part,
            order: order + index + 1,
            isCurrent: false,
        })),
    ];
    return { name, parts };
}

export default async function MockArticlePreviewPage() {
    const { frontmatter } = SAMPLE_DRAFT;
    const related = getLatestArticles(4);
    const preview = await renderMarkdown(SAMPLE_DRAFT.body);
    const series = frontmatter.series
        ? mockSeries(
              frontmatter.series.name,
              frontmatter.series.order,
              frontmatter.title
          )
        : null;

    return (
        <main
            className={cn(
                jetBrainsMono.variable,
                'container mx-auto px-4 py-20 sm:py-28'
            )}
        >
            <ReadingProgress accentColors={MOCK_ACCENT_COLORS} />
            <Breadcrumb currentName={frontmatter.title} />

            <article>
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    <ArticleCover
                        src={frontmatter.cover ?? ''}
                        alt=""
                        className="h-auto rounded-2xl"
                    />
                    <header>
                        <ArticleMeta
                            date={frontmatter.date}
                            updated={frontmatter.updated}
                            readingMinutes={6}
                            difficulty={frontmatter.difficulty}
                        />
                        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                            {frontmatter.title}
                        </h1>
                        <p className="text-foreground/80 mt-5 text-lg leading-relaxed">
                            {frontmatter.description}
                        </p>
                        <ul className="mt-6 flex flex-wrap gap-2">
                            {frontmatter.tags.map((tag) => (
                                <TagLink
                                    key={tag}
                                    tag={tag}
                                    className="px-3 py-1 text-sm"
                                />
                            ))}
                        </ul>
                        <TechStack
                            tech={frontmatter.tech}
                            className="mt-5"
                        />
                    </header>
                </div>

                <div className="via-foreground/50 mt-12 h-px bg-linear-to-r from-transparent to-transparent" />

                <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12 xl:gap-16">
                    <div className="min-w-0">
                        {series && (
                            <SeriesNav
                                series={series}
                                currentSlug="series-part-current"
                                accentColors={MOCK_ACCENT_COLORS}
                                className="mb-8"
                            />
                        )}
                        <WhatYoullLearn
                            items={frontmatter.learn}
                            accentColors={MOCK_ACCENT_COLORS}
                            className="mb-8"
                        />
                        <MobileTableOfContents
                            toc={preview.toc}
                            accentColors={MOCK_ACCENT_COLORS}
                        />
                        <ArticleContent html={preview.html} />
                        <MermaidRenderer />
                        <CodeBlockCopy />
                        <ImageLightbox />
                        <ArticlePager
                            previous={related[0]}
                            next={related[1]}
                        />
                    </div>

                    <aside className="hidden lg:block">
                        <TableOfContents
                            toc={preview.toc}
                            accentColors={MOCK_ACCENT_COLORS}
                        />
                    </aside>
                </div>
            </article>

            {related.length > 0 && (
                <aside
                    aria-label="Related articles"
                    className="border-foreground/10 mt-20 border-t pt-12"
                >
                    <h2 className="text-xl font-bold sm:text-2xl">
                        Related articles
                    </h2>
                    <ArticleGrid
                        articles={related}
                        compact
                        className="mt-10 lg:grid-cols-4"
                    />
                </aside>
            )}
        </main>
    );
}
