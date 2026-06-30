'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import ArticleContent from '@/components/pages/articles/ArticleContent';
import ArticleMeta from '@/components/pages/articles/ArticleMeta';
import WhatYoullLearn from '@/components/pages/articles/WhatYoullLearn';
import MermaidRenderer from '@/components/pages/articles/MermaidRenderer';
import CodeBlockCopy from '@/components/pages/articles/CodeBlock';
import ImageLightbox from '@/components/pages/articles/ImageLightbox';
import Icon, { type IconName } from '@/components/admin/ui/Icon';
import { iconButtonClasses } from '@/components/admin/ui/Button';
import Spinner from '@/components/admin/ui/Spinner';
import { usePreview } from '@/components/admin/Editor/hooks/usePreview';
import { coverGradientForSlug } from '@/utils/generateArticleCover';
import { cn } from '@/utils/cn';
import type { ArticleFrontmatter } from '@/lib/admin/types';

type Device = 'mobile' | 'tablet' | 'desktop';

const DEVICES: { id: Device; icon: IconName; width: string }[] = [
    { id: 'mobile', icon: 'phone', width: '24rem' },
    { id: 'tablet', icon: 'tablet', width: '46rem' },
    { id: 'desktop', icon: 'monitor', width: '100%' },
];

function readingMinutes(content: string): number {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

/**
 * The live preview. Body Markdown is rendered server-side through the exact
 * production pipeline, then displayed with the same ArticleContent prose styles
 * and the same client enhancers (Mermaid, code copy, image lightbox) as a real
 * article page, inside a selectable device frame.
 */
export default function LivePreview({
    frontmatter,
    content,
    slug,
}: {
    frontmatter: ArticleFrontmatter;
    content: string;
    slug: string;
}) {
    const { html, loading, error } = usePreview(content, true);
    const [device, setDevice] = useState<Device>('desktop');
    const [fullscreen, setFullscreen] = useState(false);
    const width = DEVICES.find((option) => option.id === device)!.width;
    const accent = coverGradientForSlug(slug || 'preview');

    const surface = (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-foreground/10 bg-background/80 flex items-center gap-2 border-b px-3 py-1.5 backdrop-blur">
                <span className="text-foreground/45 mr-1 text-xs font-semibold tracking-wide uppercase">
                    Preview
                </span>
                {loading && <Spinner className="text-foreground/40 size-3.5" />}
                <div className="border-foreground/15 ml-auto flex items-center rounded-lg border p-0.5">
                    {DEVICES.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setDevice(option.id)}
                            aria-label={`${option.id} width`}
                            aria-pressed={device === option.id}
                            className={iconButtonClasses(
                                cn(
                                    'size-7',
                                    device === option.id &&
                                        'bg-foreground/10 text-foreground'
                                )
                            )}
                        >
                            <Icon name={option.icon} className="size-4" />
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => setFullscreen((value) => !value)}
                    aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    className={iconButtonClasses('size-7')}
                >
                    <Icon
                        name={fullscreen ? 'minimize' : 'maximize'}
                        className="size-4"
                    />
                </button>
            </div>

            <div className="bg-foreground/[0.015] min-h-0 flex-1 overflow-auto">
                {error ? (
                    <p className="p-6 text-sm text-red-500">{error}</p>
                ) : (
                    <div
                        className="mx-auto px-5 py-8 transition-[max-width] duration-300 sm:px-8"
                        style={{ maxWidth: width }}
                    >
                        <article>
                            <ArticleMeta
                                date={frontmatter.date}
                                updated={frontmatter.updated}
                                readingMinutes={readingMinutes(content)}
                                difficulty={frontmatter.difficulty}
                            />
                            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                                {frontmatter.title || 'Untitled article'}
                            </h1>
                            {frontmatter.description && (
                                <p className="text-foreground/80 mt-4 text-lg leading-relaxed">
                                    {frontmatter.description}
                                </p>
                            )}
                            {frontmatter.tags.length > 0 && (
                                <ul className="mt-5 flex flex-wrap gap-2">
                                    {frontmatter.tags.map((tag) => (
                                        <li
                                            key={tag}
                                            className="border-foreground/15 text-foreground/70 rounded-full border px-3 py-1 text-sm"
                                        >
                                            {tag}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {frontmatter.learn.length > 0 && (
                                <WhatYoullLearn
                                    items={frontmatter.learn}
                                    accentColors={accent}
                                    className="mt-8"
                                />
                            )}
                            <div key={html}>
                                <ArticleContent html={html} />
                                <MermaidRenderer />
                                <CodeBlockCopy />
                                <ImageLightbox />
                            </div>
                        </article>
                    </div>
                )}
            </div>
        </div>
    );

    if (fullscreen && typeof document !== 'undefined') {
        return createPortal(
            <div className="bg-background fixed inset-0 z-[90]">{surface}</div>,
            document.body
        );
    }

    return surface;
}
