import { useEffect, useState } from 'react';

/**
 * Tracks which section (by element id) sits around the middle of the viewport.
 * Returns the active id, or null when disabled or when no section is in the
 * band (for example at the very top of the page, over the hero). Pass a stable
 * `sectionIds` reference to avoid re-subscribing on every render.
 */
export function useScrollSpy(
    sectionIds: string[],
    enabled = true
): string | null {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setActiveId(null);
            return;
        }
        const sections = sectionIds
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);
        if (!sections.length) {
            return;
        }
        // Remember every section's latest ratio: an observer callback only
        // reports the entries that changed, so one section leaving the band
        // must not clear another that is still in it. When all are zero (e.g.
        // scrolled back up over the hero) the active id falls back to null.
        const ratios = new Map<string, number>();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    ratios.set(
                        entry.target.id,
                        entry.isIntersecting ? entry.intersectionRatio : 0
                    );
                }
                let topId: string | null = null;
                let topRatio = 0;
                for (const [id, ratio] of ratios) {
                    if (ratio > topRatio) {
                        topRatio = ratio;
                        topId = id;
                    }
                }
                setActiveId(topId);
            },
            { rootMargin: '-40% 0px -50% 0px' }
        );
        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, [sectionIds, enabled]);

    return activeId;
}
