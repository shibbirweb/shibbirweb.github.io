'use client';

import { usePathname } from 'next/navigation';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import {
    heroId,
    pageItems,
    sectionIds,
    sectionItems,
    type NavItemData,
} from './contents';
import { useNavbarVisibility } from './hooks/useNavbarVisibility';
import { useScrollSpy } from './hooks/useScrollSpy';

export default function Navbar() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const visible = useNavbarVisibility(isHome, heroId);
    const activeSection = useScrollSpy(sectionIds, isHome);

    const isActive = (item: NavItemData) =>
        item.sectionId
            ? isHome && activeSection === item.sectionId
            : pathname === item.href;

    return (
        <>
            <DesktopNav
                visible={visible}
                sectionItems={sectionItems}
                pageItems={pageItems}
                isActive={isActive}
            />
            <MobileNav
                visible={visible}
                sectionItems={sectionItems}
                pageItems={pageItems}
                isActive={isActive}
            />
        </>
    );
}
