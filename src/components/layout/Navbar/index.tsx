'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Shibbir from '@/components/icons/shibbir';
import { cn } from '@/utils/cn';
import NavItem from './NavItem';
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
        <nav
            aria-label="Primary"
            className={cn(
                'fixed top-4 left-1/2 z-50 hidden -translate-x-1/2 transition-all duration-500 ease-out motion-reduce:transition-none md:block',
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-24 opacity-0'
            )}
        >
            <ul className="border-foreground/10 bg-background/60 flex items-center gap-1 rounded-full border px-2 py-1.5 shadow-lg shadow-black/5 backdrop-blur-lg">
                <li>
                    <Link
                        href="/#hero"
                        aria-label="Home"
                        className="text-foreground/80 hover:text-foreground block px-2 py-1.5 transition-colors"
                    >
                        <Shibbir className="h-5 w-auto" />
                    </Link>
                </li>
                <li
                    aria-hidden="true"
                    className="bg-foreground/15 mx-1 h-5 w-px"
                />
                {sectionItems.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        active={isActive(item)}
                    />
                ))}
                <li
                    aria-hidden="true"
                    className="bg-foreground/15 mx-1 h-5 w-px"
                />
                {pageItems.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        active={isActive(item)}
                    />
                ))}
            </ul>
        </nav>
    );
}
