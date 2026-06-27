import { useEffect, useState } from 'react';

/**
 * Tracks which section (by element id) sits around the middle of the viewport.
 * Returns the active id, or null when disabled or none is active. Pass a stable
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
        const observer = new IntersectionObserver(
            (entries) => {
                const inView = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (inView.length) {
                    setActiveId(inView[0].target.id);
                }
            },
            { rootMargin: '-40% 0px -50% 0px' }
        );
        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, [sectionIds, enabled]);

    return activeId;
}
