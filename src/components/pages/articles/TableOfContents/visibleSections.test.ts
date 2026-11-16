import { describe, expect, it } from 'vitest';
import { visibleSectionIds } from '@/components/pages/articles/TableOfContents/visibleSections';

const sections = [
    { id: 'intro', top: 100 },
    { id: 'setup', top: 600 },
    { id: 'wrap-up', top: 1200 },
];

describe('visibleSectionIds', () => {
    it('lists every section overlapping the band, in order', () => {
        expect(visibleSectionIds(sections, 1500, 80, 900)).toEqual([
            'intro',
            'setup',
        ]);
    });

    it('runs the last section down to the end of the content', () => {
        expect(visibleSectionIds(sections, 1500, 1300, 2000)).toEqual([
            'wrap-up',
        ]);
    });

    it('skips a section that ends above the band', () => {
        const scrolled = sections.map((section) => ({
            ...section,
            top: section.top - 700,
        }));

        expect(visibleSectionIds(scrolled, 800, 80, 900)).toEqual([
            'setup',
            'wrap-up',
        ]);
    });

    it('finds nothing before the first heading reaches the band', () => {
        const below = sections.map((section) => ({
            ...section,
            top: section.top + 1000,
        }));

        expect(visibleSectionIds(below, 2500, 80, 900)).toEqual([]);
    });

    it('keeps the last section once the article is scrolled past', () => {
        const above = sections.map((section) => ({
            ...section,
            top: section.top - 3000,
        }));

        expect(visibleSectionIds(above, -1500, 80, 900)).toEqual(['wrap-up']);
    });

    it('returns nothing when there are no sections', () => {
        expect(visibleSectionIds([], 0, 80, 900)).toEqual([]);
    });
});
