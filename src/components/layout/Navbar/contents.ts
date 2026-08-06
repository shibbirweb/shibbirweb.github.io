export type NavItemData = {
    label: string;
    href: string;
    sectionId?: string;
    /** Open in a new tab via a plain anchor (e.g. the resume PDF file). */
    external?: boolean;
};

// In-page section anchors (homepage) and standalone page links.
export const sectionItems: NavItemData[] = [
    { label: 'About', href: '/#about', sectionId: 'about' },
    { label: 'Skills', href: '/#skills', sectionId: 'skills' },
    { label: 'Projects', href: '/#work', sectionId: 'work' },
    { label: 'Contact', href: '/#contact', sectionId: 'contact' },
];

export const articlesItem: NavItemData = {
    label: 'Articles',
    href: '/articles',
};

export const pageItems: NavItemData[] = [
    { label: 'Uses', href: '/uses' },
    { label: 'Now', href: '/now' },
];

export const resumeItem: NavItemData = {
    label: 'Resume',
    // The on-site resume page (src/app/resume); it has its own Download PDF
    // (print) action. The static-PDF machinery in @/lib/resume is kept but no
    // longer linked here.
    href: '/resume',
};

// Dev-only authoring tools, surfaced under a "Studio" dropdown. Gated on
// NODE_ENV in Navbar so the group and its links never render in the built site.
export const studioItems: NavItemData[] = [
    { label: 'Article Editor', href: '/studio/article-editor' },
];

// Home page section anchors tracked by the scroll spy, in document order (see
// src/app/page.tsx). A superset of the sectionItems above: the Articles teaser
// owns the URL hash while it is in view, but it is not a navbar entry (the
// navbar's Articles link points at the /articles page). Every sectionId in
// sectionItems must appear here.
export const homeSectionIds = [
    'about',
    'skills',
    'work',
    'articles',
    'contact',
];

// id of the hero element on the home page; observed to toggle the navbar.
export const heroId = 'hero';
