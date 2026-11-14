'use client';

import { useRef, type ReactNode } from 'react';
import { useSpotlightSurfaces } from '@/components/pages/common/hooks/useSpotlightSurfaces';

/**
 * A <ul> that lights whichever of its surfaces the cursor is over. It is the only
 * client component in the spotlight, holding the single delegated pointer listener
 * for the whole list, so the cards or tiles inside stay server-rendered and their
 * icon modules never reach the client bundle.
 *
 * Each surface inside must carry the spotlightSurfaceAttribute and read
 * --pointer-x / --pointer-y in its own CSS module. `children` is the already
 * rendered list content, so this wrapper adds no layout of its own beyond the
 * caller's className.
 */
export default function SpotlightList({
    className,
    labelledBy,
    children,
}: {
    className: string;
    /** Id of the heading that names this list, when it has one. */
    labelledBy?: string;
    children: ReactNode;
}) {
    const listRef = useRef<HTMLUListElement>(null);
    useSpotlightSurfaces(listRef);

    return (
        <ul
            ref={listRef}
            aria-labelledby={labelledBy}
            className={className}
        >
            {children}
        </ul>
    );
}
