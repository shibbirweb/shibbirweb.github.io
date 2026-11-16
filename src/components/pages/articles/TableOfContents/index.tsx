'use client';

import { useMemo, useRef } from 'react';
import TocRail from '@/components/pages/articles/TableOfContents/TocRail';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';
import { useScrollActiveIntoView } from '@/components/pages/articles/TableOfContents/hooks/useScrollActiveIntoView';
import { useScrollDirection } from '@/components/pages/articles/TableOfContents/hooks/useScrollDirection';
import { useVisibleSections } from '@/components/pages/articles/TableOfContents/hooks/useVisibleSections';
import { accentStyle } from '@/utils/accentStyle';
import type { TocItem } from '@/lib/posts';

/**
 * Desktop "On this page" navigator that sticks beside the article. A rail down
 * its left edge highlights every section on screen and follows the reader as
 * they scroll. Hidden below `lg`, where
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
    const visibleIds = useVisibleSections(ids);
    const scrollDirection = useScrollDirection();
    const navRef = useRef<HTMLElement>(null);
    useScrollActiveIntoView(navRef, activeId);

    if (toc.length === 0) return null;

    return (
        <nav
            ref={navRef}
            aria-label="Table of contents"
            style={accentStyle(accentColors)}
            className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
        >
            <p className="text-foreground/70 mb-3 text-xs font-semibold tracking-[0.12em] uppercase">
                On this page
            </p>
            <TocRail
                toc={toc}
                currentId={activeId}
                visibleIds={visibleIds}
                direction={scrollDirection}
            />
        </nav>
    );
}
