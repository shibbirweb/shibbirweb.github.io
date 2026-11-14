'use client';

import { useRef, type ReactNode } from 'react';
import { useHasNearedViewport } from '@/components/pages/common/hooks/useHasNearedViewport';

/**
 * Wraps the skills content and marks it `data-skill-icons="ready"` once it
 * comes near the viewport, which is what lets SkillIcon load its logo file.
 * The logos are decorative, so they wait; the skill names, headings and
 * summaries are plain server-rendered text inside `children` and ship in the
 * static HTML either way.
 */
export default function SkillIconsRegion({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    const regionRef = useRef<HTMLDivElement>(null);
    const hasNearedViewport = useHasNearedViewport(regionRef);

    return (
        <div
            ref={regionRef}
            data-skill-icons={hasNearedViewport ? 'ready' : 'pending'}
            className={className}
        >
            {children}
        </div>
    );
}
