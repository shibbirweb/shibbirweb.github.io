/** A heading's id and its top edge, in viewport pixels. */
export type SectionTop = {
    id: string;
    top: number;
};

/**
 * The ids of every section that overlaps the visible band `[viewTop,
 * viewBottom)` of the viewport. A section runs from its heading down to the
 * next heading, and the last one runs to `contentBottom` (the end of the
 * article body). Order follows `sections`, so the result is contiguous.
 *
 * Once the article has scrolled away above the band (the reader is down in the
 * comments or related articles), the last section stays lit, so the rail keeps
 * its place at the end and moves straight back up when the reader scrolls up.
 */
export function visibleSectionIds(
    sections: SectionTop[],
    contentBottom: number,
    viewTop: number,
    viewBottom: number
): string[] {
    const visibleIds: string[] = [];

    sections.forEach((section, index) => {
        const nextSection = sections[index + 1];
        const sectionBottom = nextSection ? nextSection.top : contentBottom;

        if (sectionBottom > viewTop && section.top < viewBottom) {
            visibleIds.push(section.id);
        }
    });

    const lastSection = sections[sections.length - 1];
    if (visibleIds.length === 0 && lastSection && contentBottom <= viewTop) {
        return [lastSection.id];
    }

    return visibleIds;
}
