'use client';

import { usePathname } from 'next/navigation';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import {
    articlesItem,
    heroId,
    pageItems,
    sectionIds,
    sectionItems,
    type NavItemData,
} from './contents';
import { useNavbarVisibility } from './hooks/useNavbarVisibility';
import { useScrollSpy } from './hooks/useScrollSpy';

export default function Navbar({
    hasArticles = false,
}: {
    hasArticles?: boolean;
}) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const visible = useNavbarVisibility(isHome, heroId);
    const activeSection = useScrollSpy(sectionIds, isHome);
    const pages = hasArticles ? [articlesItem, ...pageItems] : pageItems;

    const isActive = (item: NavItemData) =>
        item.sectionId
            ? isHome && activeSection === item.sectionId
            : pathname === item.href;

    return (
        <>
            <DesktopNav
                visible={visible}
                sectionItems={sectionItems}
                pageItems={pages}
                isActive={isActive}
            />
            <MobileNav
                visible={visible}
                sectionItems={sectionItems}
                pageItems={pages}
                isActive={isActive}
            />
        </>
    );
}
