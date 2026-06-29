'use client';

import { useMemo } from 'react';
import TocList from '@/components/pages/articles/TableOfContents/TocList';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';
import { accentStyle } from '@/utils/accentStyle';
import type { TocItem } from '@/lib/posts';

/**
 * Desktop "On this page" navigator that sticks beside the article and highlights
 * the heading currently in view. Hidden below `lg`, where
 * MobileTableOfContents takes over. Tinted with the article's cover accent.
 */
export default function TableOfContents({
    toc,
    accentColors,
}: {
    toc: TocItem[];
    accentColors: readonly [string, string];
}) {
    const ids = useMemo(() => toc.map((item) => item.id), [toc]);
    const activeId = useScrollSpy(ids);

    if (toc.length === 0) return null;

    return (
        <nav
            aria-label="Table of contents"
            style={accentStyle(accentColors)}
            className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
        >
            <p className="text-foreground/45 mb-3 text-xs font-semibold tracking-[0.12em] uppercase">
                On this page
            </p>
            <TocList
                toc={toc}
                activeId={activeId}
            />
        </nav>
    );
}
