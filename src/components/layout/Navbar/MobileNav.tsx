'use client';

import { useRef } from 'react';
import { cn } from '@/utils/cn';
import MobileMenuButton from '@/components/layout/Navbar/MobileMenuButton';
import MobileMenuPanel from '@/components/layout/Navbar/MobileMenuPanel';
import MobileWordmark from '@/components/layout/Navbar/MobileWordmark';
import type { NavItemData } from '@/components/layout/Navbar/contents';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';
import { useCloseOnEscape } from '@/components/layout/Navbar/hooks/useCloseOnEscape';
import { useCloseOnClickOutside } from '@/components/layout/Navbar/hooks/useCloseOnClickOutside';
import { useCloseOnRouteChange } from '@/components/layout/Navbar/hooks/useCloseOnRouteChange';

interface MobileNavProps {
    visible: boolean;
    isHome: boolean;
    sectionItems: NavItemData[];
    pageItems: NavItemData[];
    /** Dev-only authoring links; empty in production, so the group is hidden. */
    studioItems: NavItemData[];
    isActive: (item: NavItemData) => boolean;
}

export default function MobileNav({
    visible,
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
                className={cn(
                    'fixed top-4 right-4 z-50 transition-all duration-700 ease-in-out motion-reduce:transition-none md:hidden',
                    visible
                        ? 'visible translate-x-0 opacity-100'
                        : 'pointer-events-none invisible translate-x-24 opacity-0'
                )}
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
             * Rendered as a sibling of (not inside) the menu container above, for
             * two reasons: that container carries a transform for its show/hide,
             * which would become the containing block for the wordmark's `fixed`
             * and break its centering; and being later in the DOM keeps it above
             * the panel so the logo reads on top when it lands in the slot.
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
