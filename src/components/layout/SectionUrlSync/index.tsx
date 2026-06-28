'use client';

import { heroId, sectionIds } from '@/components/layout/Navbar/contents';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';
import { useSectionUrlSync } from '@/components/layout/SectionUrlSync/hooks/useSectionUrlSync';

// Stable reference (the spy re-subscribes whenever this array identity changes),
// the hero plus every section anchor, in document order.
const spyIds = [heroId, ...sectionIds];

/**
 * Home page only: keeps the URL hash pointing at the section in view as the
 * visitor scrolls (#about, #work, ...), clearing it back to "/" at the hero.
 * Renders nothing.
 */
export default function SectionUrlSync() {
    const activeId = useScrollSpy(spyIds);
    useSectionUrlSync(activeId, heroId);
    return null;
}
