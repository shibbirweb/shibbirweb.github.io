'use client';

import ArticleContent from '@/components/pages/articles/ArticleContent';
import CodeBlockCopy from '@/components/pages/articles/CodeBlock';
import ImageLightbox from '@/components/pages/articles/ImageLightbox';
import MermaidRenderer from '@/components/pages/articles/MermaidRenderer';
import TocList from '@/components/pages/articles/TableOfContents/TocList';
import { useMarkdownPreview } from '@/components/pages/article-editor/ArticleEditor/hooks/useMarkdownPreview';

export default function EditorPreview({ body }: { body: string }) {
    const { html, toc, renderKey } = useMarkdownPreview(body);

    return (
        <section className="border-foreground/10 bg-background/70 flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm backdrop-blur">
            <div className="border-foreground/10 flex shrink-0 items-center justify-between border-b px-5 py-4">
                <div>
                    <p className="text-foreground/45 text-xs font-semibold tracking-[0.2em] uppercase">
                        Preview
                    </p>
                    <h2 className="mt-1 font-semibold">Production body</h2>
                </div>
                <span className="border-foreground/10 bg-foreground/5 rounded-full border px-2.5 py-1 text-xs">
                    Live
                </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
                <div className="bg-foreground/5 text-foreground/70 mt-5 rounded-lg px-3 py-2 text-xs">
                    Live render of the body through the production Markdown,
                    Shiki, gist, Mermaid, and article component pipeline.
                </div>
                {toc.length > 0 && (
                    <nav
                        aria-label="Table of contents"
                        className="border-foreground/10 bg-foreground/[0.02] mt-5 rounded-xl border p-4"
                    >
                        <p className="text-foreground/45 mb-3 text-xs font-semibold tracking-[0.12em] uppercase">
                            On this page
                        </p>
                        <TocList
                            toc={toc}
                            activeId={null}
                        />
                    </nav>
                )}
                <article className="mt-8">
                    <ArticleContent html={html} />
                    <MermaidRenderer key={`mermaid-${renderKey}`} />
                    <CodeBlockCopy key={`code-${renderKey}`} />
                    <ImageLightbox key={`lightbox-${renderKey}`} />
                </article>
            </div>
        </section>
    );
}
