import { careerExperience } from '@/config/constants';

export type Facet = {
    title: string;
    text: string;
    /** Accent colour for the facet's dot and its connector line. */
    accent: string;
    /** Placement on the lg 3x3 grid (corners around the centre core). */
    placementClassName: string;
    /** Connector endpoint, as a percentage of the diagram box (the core is 50,50). */
    line: { x: number; y: number };
};

// What shapes how Shibbir works, told as facets of the person rather than a
// skills list (the Skills section already covers the stack) or a name/title
// (already in the hero). This is the part only "About me" should carry.
export const facets: Facet[] = [
    {
        title: 'Craft',
        text: 'I care about clean, maintainable code and reliable systems.',
        accent: 'var(--color-blue-500)',
        placementClassName: 'lg:col-start-1 lg:row-start-1',
        line: { x: 16, y: 18 },
    },
    {
        title: 'Range',
        text: `${careerExperience}+ years shipping across healthcare, e-commerce, and the public sector.`,
        accent: 'var(--color-emerald-500)',
        placementClassName: 'lg:col-start-3 lg:row-start-1',
        line: { x: 84, y: 18 },
    },
    {
        title: 'Now',
        text: 'Lately, going deep on AI engineering.',
        accent: 'var(--color-orange-500)',
        placementClassName: 'lg:col-start-1 lg:row-start-3',
        line: { x: 16, y: 82 },
    },
    {
        title: 'End to end',
        text: 'Comfortable across the full stack, from database to UI to deploy.',
        accent: 'var(--color-rose-500)',
        placementClassName: 'lg:col-start-3 lg:row-start-3',
        line: { x: 84, y: 82 },
    },
];