'use client';

import { useRef } from 'react';
import MobileMenuButton from '@/components/layout/Navbar/MobileMenuButton';
import MobileMenuPanel from '@/components/layout/Navbar/MobileMenuPanel';
import MobileWordmark from '@/components/layout/Navbar/MobileWordmark';
import type { NavItemData } from '@/components/layout/Navbar/contents';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';
import { useCloseOnEscape } from '@/components/layout/Navbar/hooks/useCloseOnEscape';
import { useCloseOnClickOutside } from '@/components/layout/Navbar/hooks/useCloseOnClickOutside';
import { useCloseOnRouteChange } from '@/components/layout/Navbar/hooks/useCloseOnRouteChange';

interface MobileNavProps {
    isHome: boolean;
    sectionItems: NavItemData[];
    pageItems: NavItemData[];
    /** Dev-only authoring links; empty in production, so the group is hidden. */
    studioItems: NavItemData[];
    isActive: (item: NavItemData) => boolean;
}

export default function MobileNav({
    isHome,
    sectionItems,
    pageItems,
    studioItems,
    isActive,
}: MobileNavProps) {
    const { open, toggle, close } = useDisclosure();
    const menuRef = useRef<HTMLDivElement>(null);
    useCloseOnEscape(open, close);
    useCloseOnClickOutside(menuRef, open, close);
    useCloseOnRouteChange(close);

    return (
        <>
            <div
                ref={menuRef}
                className="fixed top-4 right-4 z-50 md:hidden"
            >
                <MobileMenuButton
                    open={open}
                    onToggle={toggle}
                />
                <MobileMenuPanel
                    open={open}
                    isHome={isHome}
                    sectionItems={sectionItems}
                    pageItems={pageItems}
                    studioItems={studioItems}
                    isActive={isActive}
                    onNavigate={close}
                />
            </div>
            {/*
             * Inner pages only: home keeps the logo as a static item inside the
             * panel (MobileMenuPanel), with no centered wordmark and no travel.
             * Rendered as a sibling of (not inside) the menu container above so
             * that being later in the DOM keeps it above the panel, letting the
             * logo read on top when it lands in the slot.
             */}
            {!isHome && (
                <MobileWordmark
                    open={open}
                    onNavigate={close}
                />
            )}
        </>
    );
}
