'use client';

import { heroId, homeSectionIds } from '@/components/layout/Navbar/contents';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';
import { useSectionUrlSync } from '@/components/layout/SectionUrlSync/hooks/useSectionUrlSync';

// Stable reference (the spy re-subscribes whenever this array identity changes),
// the hero plus every home section anchor, in document order.
const spyIds = [heroId, ...homeSectionIds];

/**
 * Home page only: keeps the URL hash pointing at the section in view as the
 * visitor scrolls (#about, #work, #articles, ...), clearing it back to "/" at
 * the hero. Tracks every section anchor, including the ones with no navbar
 * entry. Renders nothing.
 */
export default function SectionUrlSync() {
    const activeId = useScrollSpy(spyIds);
    useSectionUrlSync(activeId, heroId);
    return null;
}
