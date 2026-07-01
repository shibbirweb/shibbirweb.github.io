'use client';

import { usePathname } from 'next/navigation';
import DesktopNav from '@/components/layout/Navbar/DesktopNav';
import MobileNav from '@/components/layout/Navbar/MobileNav';
import {
    articlesItem,
    heroId,
    pageItems,
    resumeItem,
    sectionIds,
    sectionItems,
    type NavItemData,
} from '@/components/layout/Navbar/contents';
import { useHeroPassed } from '@/components/layout/Navbar/hooks/useHeroPassed';
import { useNavbarVisibility } from '@/components/layout/Navbar/hooks/useNavbarVisibility';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';

export default function Navbar({
    hasArticles = false,
    hasResume = false,
}: {
    hasArticles?: boolean;
    hasResume?: boolean;
}) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const visible = useNavbarVisibility(isHome, heroId);
    const brandVisible = useHeroPassed(isHome, heroId);
    const activeSection = useScrollSpy(sectionIds, isHome);
    const pages = [
        ...(hasArticles ? [articlesItem] : []),
        ...pageItems,
        ...(hasResume ? [resumeItem] : []),
    ];

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
                isActive={isActive}
            />
            <MobileNav
                visible={visible}
                isHome={isHome}
                sectionItems={sectionItems}
                pageItems={pages}
                isActive={isActive}
            />
        </>
    );
}
