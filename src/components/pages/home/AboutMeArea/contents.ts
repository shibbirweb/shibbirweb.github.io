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
    /** CSS position of the inner corner where the line attaches: the origin of
     *  the hover gradient, so it grows from the same direction as the line. */
    origin: string;
};

// What shapes how Shibbir works, told as facets of the person rather than a
// skills list (the Skills section already covers the stack) or a name/title
// (already in the hero). This is the part only "About me" should carry.
export const facets: Facet[] = [
    {
        title: 'Craft',
        text: 'I turn complex problems into simple, maintainable software that teams can confidently build on for years.',
        accent: 'var(--color-blue-500)',
        placementClassName: 'lg:col-start-1 lg:row-start-1',
        line: { x: 16, y: 18 },
        origin: '100% 100%',
    },
    {
        title: 'Range',
        text: `${careerExperience}+ years delivering production software across healthcare, e-commerce, SaaS, and the public sector.`,
        accent: 'var(--color-emerald-500)',
        placementClassName: 'lg:col-start-3 lg:row-start-1',
        line: { x: 84, y: 18 },
        origin: '0% 100%',
    },
    {
        title: 'Now',
        text: 'Currently exploring AI agents, RAG, MCP, and developer tooling for AI-assisted software engineering.',
        accent: 'var(--color-orange-500)',
        placementClassName: 'lg:col-start-1 lg:row-start-3',
        line: { x: 16, y: 82 },
        origin: '100% 0%',
    },
    {
        title: 'End to end',
        text: 'From architecture to self-hosted infrastructure, I enjoy owning the entire product lifecycle and shipping complete systems.',
        accent: 'var(--color-rose-500)',
        placementClassName: 'lg:col-start-3 lg:row-start-3',
        line: { x: 84, y: 82 },
        origin: '0% 0%',
    },
];