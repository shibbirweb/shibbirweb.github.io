'use client';

import { cn } from '@/utils/cn';
import MobileMenuButton from './MobileMenuButton';
import MobileMenuPanel from './MobileMenuPanel';
import MobileWordmark from './MobileWordmark';
import type { NavItemData } from './contents';
import { useDisclosure } from './hooks/useDisclosure';
import { useCloseOnEscape } from './hooks/useCloseOnEscape';
import { useCloseOnRouteChange } from './hooks/useCloseOnRouteChange';

interface MobileNavProps {
    visible: boolean;
    isHome: boolean;
    sectionItems: NavItemData[];
    pageItems: NavItemData[];
    isActive: (item: NavItemData) => boolean;
}

export default function MobileNav({
    visible,
    isHome,
    sectionItems,
    pageItems,
    isActive,
}: MobileNavProps) {
    const { open, toggle, close } = useDisclosure();
    useCloseOnEscape(open, close);
    useCloseOnRouteChange(close);

    return (
        <>
            <div
                className={cn(
                    'fixed top-4 right-4 z-50 transition-all duration-500 ease-out motion-reduce:transition-none md:hidden',
                    visible
                        ? 'visible translate-y-0 opacity-100'
                        : 'pointer-events-none invisible -translate-y-24 opacity-0'
                )}
            >
                {open && (
                    <div
                        aria-hidden="true"
                        onClick={close}
                        className="fixed inset-0"
                    />
                )}
                <MobileMenuButton
                    open={open}
                    onToggle={toggle}
                />
                <MobileMenuPanel
                    open={open}
                    isHome={isHome}
                    sectionItems={sectionItems}
                    pageItems={pageItems}
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
