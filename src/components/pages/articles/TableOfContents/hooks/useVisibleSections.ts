import { useEffect, useState } from 'react';
import { visibleSectionIds } from '@/components/pages/articles/TableOfContents/visibleSections';

// Space the sticky navbar covers at the top of the viewport; a section hidden
// behind it does not count as on screen.
const NAVBAR_OFFSET_PX = 80;

/**
 * Tracks every article section that is at least partly on screen, so the
 * table of contents can light up the whole visible range rather than a single
 * heading. Recomputes once per animation frame while scrolling or resizing,
 * and only re-renders when the set actually changes. Pass a stable `sectionIds`
 * reference to avoid re-subscribing on every render.
 */
export function useVisibleSections(sectionIds: string[]): string[] {
    const [visibleIds, setVisibleIds] = useState<string[]>([]);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            const headings = sectionIds
                .map((id) => document.getElementById(id))
                .filter((heading): heading is HTMLElement => heading !== null);
            const lastHeading = headings[headings.length - 1];
            if (!lastHeading) {
                setVisibleIds([]);
                return;
            }

            // The article body (the headings' parent) ends the last section.
            const contentBottom =
                lastHeading.parentElement?.getBoundingClientRect().bottom ??
                lastHeading.getBoundingClientRect().bottom;
            const nextIds = visibleSectionIds(
                headings.map((heading) => ({
                    id: heading.id,
                    top: heading.getBoundingClientRect().top,
                })),
                contentBottom,
                NAVBAR_OFFSET_PX,
                window.innerHeight
            );

            setVisibleIds((currentIds) => {
                if (currentIds.join('|') === nextIds.join('|')) {
                    return currentIds;
                }
                return nextIds;
            });
        };

        const onScroll = () => {
            if (!frame) {
                frame = requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame) {
                cancelAnimationFrame(frame);
            }
        };
    }, [sectionIds]);

    return visibleIds;
}
