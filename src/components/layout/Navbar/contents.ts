export type NavItemData = { label: string; href: string; sectionId?: string };

// In-page section anchors (homepage) and standalone page links.
export const sectionItems: NavItemData[] = [
    { label: 'About', href: '/#about', sectionId: 'about' },
    { label: 'Projects', href: '/#work', sectionId: 'work' },
    { label: 'Skills', href: '/#skills', sectionId: 'skills' },
    { label: 'Contact', href: '/#contact', sectionId: 'contact' },
];

export const pageItems: NavItemData[] = [
    { label: 'Uses', href: '/uses' },
    { label: 'Now', href: '/now' },
];

export const sectionIds = sectionItems.map((item) => item.sectionId as string);

// id of the hero element on the home page; observed to toggle the navbar.
export const heroId = 'hero';
