'use client';

import { cn } from '@/utils/cn';
import MobileMenuButton from './MobileMenuButton';
import MobileMenuPanel from './MobileMenuPanel';
import type { NavItemData } from './contents';
import { useDisclosure } from './hooks/useDisclosure';
import { useCloseOnEscape } from './hooks/useCloseOnEscape';
import { useCloseOnRouteChange } from './hooks/useCloseOnRouteChange';

interface MobileNavProps {
    visible: boolean;
    sectionItems: NavItemData[];
    pageItems: NavItemData[];
    isActive: (item: NavItemData) => boolean;
}

export default function MobileNav({
    visible,
    sectionItems,
    pageItems,
    isActive,
}: MobileNavProps) {
    const { open, toggle, close } = useDisclosure();
    useCloseOnEscape(open, close);
    useCloseOnRouteChange(close);

    return (
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
                sectionItems={sectionItems}
                pageItems={pageItems}
                isActive={isActive}
                onNavigate={close}
            />
        </div>
    );
}
