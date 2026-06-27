import { cn } from '@/utils/cn';
import NavItem from './NavItem';
import NavLogo from './NavLogo';
import type { NavItemData } from './contents';

interface DesktopNavProps {
    visible: boolean;
    sectionItems: NavItemData[];
    pageItems: NavItemData[];
    isActive: (item: NavItemData) => boolean;
}

export default function DesktopNav({
    visible,
    sectionItems,
    pageItems,
    isActive,
}: DesktopNavProps) {
    return (
        <nav
            aria-label="Primary"
            className={cn(
                'fixed top-4 left-1/2 z-50 hidden -translate-x-1/2 transition-all duration-500 ease-out motion-reduce:transition-none md:block',
                visible
                    ? 'visible translate-y-0 opacity-100'
                    : 'pointer-events-none invisible -translate-y-24 opacity-0'
            )}
        >
            <ul className="border-foreground/10 bg-background/60 flex items-center gap-1 rounded-full border px-2 py-1.5 shadow-lg shadow-black/5 backdrop-blur-lg">
                <li>
                    <NavLogo
                        collapsible
                        className="text-foreground/80 hover:text-foreground block px-2 py-1.5 transition-colors"
                    />
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
