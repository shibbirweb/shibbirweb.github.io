'use client';

import { useRef, type ReactNode } from 'react';
import { useSpotlightSurfaces } from '@/components/pages/common/hooks/useSpotlightSurfaces';

/**
 * A plain <div> that lights whichever of its surfaces the cursor is over: the
 * non-list counterpart of SpotlightList, for groups whose children are not list
 * items (the About facet bento). It holds the single delegated pointer listener for
 * the whole group, so the cards inside stay server-rendered.
 *
 * Each surface inside must carry the spotlightSurfaceProps and read --pointer-x /
 * --pointer-y in its own CSS module.
 *
 * For a lone surface, pass `contents` so the wrapper generates no box at all and
 * cannot disturb the layout it wraps (the resume document, whose print layout must
 * stay untouched). Bubbling follows the DOM, not the box tree, so the listener still
 * fires, and only the surface is ever measured.
 */
export default function SpotlightGroup({
    className,
    children,
}: {
    className: string;
    children: ReactNode;
}) {
    const groupRef = useRef<HTMLDivElement>(null);
    useSpotlightSurfaces(groupRef);

    return (
        <div
            ref={groupRef}
            className={className}
        >
            {children}
        </div>
    );
}
