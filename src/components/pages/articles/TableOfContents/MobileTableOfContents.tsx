'use client';

import { useMemo, useRef } from 'react';
import ChevronIcon from '@/components/icons/chevron';
import TocList from '@/components/pages/articles/TableOfContents/TocList';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';
import { accentStyle } from '@/utils/accentStyle';
import type { TocItem } from '@/lib/posts';

/**
 * Collapsible "On this page" disclosure shown above the body on small screens,
 * where there is no room for a sticky sidebar. Closes itself once a heading is
 * picked so the reader lands straight on the section.
 */
export default function MobileTableOfContents({
    toc,
    accentColors,
}: {
    toc: TocItem[];
    accentColors: readonly [string, string];
}) {
    const ids = useMemo(() => toc.map((item) => item.id), [toc]);
    const activeId = useScrollSpy(ids);
    const detailsRef = useRef<HTMLDetailsElement>(null);

    if (toc.length === 0) return null;

    return (
        <details
            ref={detailsRef}
            style={accentStyle(accentColors)}
            className="border-foreground/10 bg-foreground/[0.02] group mb-8 rounded-xl border lg:hidden"
        >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <span className="text-foreground/70 text-xs tracking-[0.12em] uppercase">
                    On this page
                </span>
                <ChevronIcon className="text-foreground/70 size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-3 pb-3">
                <TocList
                    toc={toc}
                    activeId={activeId}
                    onNavigate={() => detailsRef.current?.removeAttribute('open')}
                />
            </div>
        </details>
    );
}
