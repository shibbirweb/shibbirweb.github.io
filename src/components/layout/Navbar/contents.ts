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
    // The served copy of the content/resume PDF (matches resumePdfPublicPath in
    // @/lib/resume); the nav item opens the file directly in a new tab.
    href: '/resume-shibbir-ahmed.pdf',
    external: true,
};

// The dev-only Article Studio entry point. Only added to the nav in development
// (see Navbar `adminEnabled`); production builds never include the admin routes.
export const adminItem: NavItemData = {
    label: 'Studio',
    href: '/admin',
};

export const sectionIds = sectionItems.map((item) => item.sectionId as string);

// id of the hero element on the home page; observed to toggle the navbar.
export const heroId = 'hero';
