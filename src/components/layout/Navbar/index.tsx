'use client';

import { usePathname } from 'next/navigation';
import { isDevelopment } from '@/config/env';
import DesktopNav from '@/components/layout/Navbar/DesktopNav';
import MobileNav from '@/components/layout/Navbar/MobileNav';
import ThemeMenu from '@/components/layout/ThemeToggle/ThemeMenu';
import {
    articlesItem,
    heroId,
    pageItems,
    resumeItem,
    sectionIds,
    sectionItems,
    studioItems,
    type NavItemData,
} from '@/components/layout/Navbar/contents';
import { useHeroPassed } from '@/components/layout/Navbar/hooks/useHeroPassed';
import { useNavbarVisibility } from '@/components/layout/Navbar/hooks/useNavbarVisibility';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';

export default function Navbar({
    hasArticles = false,
}: {
    hasArticles?: boolean;
}) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const visible = useNavbarVisibility(isHome, heroId);
    const brandVisible = useHeroPassed(isHome, heroId);
    const activeSection = useScrollSpy(sectionIds, isHome);
    // The resume page always exists, so its nav item is always shown.
    const pages = [
        ...(hasArticles ? [articlesItem] : []),
        ...pageItems,
        resumeItem,
    ];
    // Dev-only authoring tools. `isDevelopment` folds to a literal at build
    // time, so the list is empty in production and the Studio group never renders.
    const studio = isDevelopment ? studioItems : [];

    const isActive = (item: NavItemData) =>
        item.sectionId
            ? isHome && activeSection === item.sectionId
            : pathname === item.href;

    return (
        <>
            <DesktopNav
                visible={visible}
                brandVisible={brandVisible}
                sectionItems={sectionItems}
                pageItems={pages}
                studioItems={studio}
                isActive={isActive}
            />
            <MobileNav
                visible={visible}
                isHome={isHome}
                sectionItems={sectionItems}
                pageItems={pages}
                studioItems={studio}
                isActive={isActive}
            />
            <ThemeMenu />
        </>
    );
}
