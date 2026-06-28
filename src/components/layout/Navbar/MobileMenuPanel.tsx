import { cn } from '@/utils/cn';
import NavItem from '@/components/layout/Navbar/NavItem';
import NavLogo from '@/components/layout/Navbar/NavLogo';
import type { NavItemData } from '@/components/layout/Navbar/contents';

interface MobileMenuPanelProps {
    open: boolean;
    isHome: boolean;
    sectionItems: NavItemData[];
    pageItems: NavItemData[];
    isActive: (item: NavItemData) => boolean;
    onNavigate: () => void;
}

export default function MobileMenuPanel({
    open,
    isHome,
    sectionItems,
    pageItems,
    isActive,
    onNavigate,
}: MobileMenuPanelProps) {
    return (
        <nav
            aria-label="Primary"
            className={cn(
                'border-foreground/10 bg-background/70 absolute top-full right-0 mt-2 w-56 origin-top-right rounded-2xl border p-2 shadow-xl shadow-black/10 backdrop-blur-lg transition-all duration-200 ease-out',
                open
                    ? 'visible scale-100 opacity-100'
                    : 'pointer-events-none invisible scale-95 opacity-0'
            )}
        >
            {isHome ? (
                // Home keeps the logo as a plain, static menu item: the hero
                // already shows the name, so there is no centered wordmark to
                // travel in, and the logo simply lives in the menu.
                <NavLogo
                    onNavigate={onNavigate}
                    className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 flex items-center rounded-xl px-4 py-3 transition-colors"
                />
            ) : (
                // Inner pages reserve the slot the shared wordmark animates into
                // (see MobileWordmark); the height matches that logo row
                // (py-3 + h-5 glyph = h-11).
                <div
                    aria-hidden="true"
                    className="h-11"
                />
            )}
            <div
                aria-hidden="true"
                className="bg-foreground/10 my-1 h-px"
            />
            <ul className="flex flex-col gap-0.5">
                {sectionItems.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        active={isActive(item)}
                        variant="row"
                        onNavigate={onNavigate}
                    />
                ))}
            </ul>
            <div
                aria-hidden="true"
                className="bg-foreground/10 my-1 h-px"
            />
            <ul className="flex flex-col gap-0.5">
                {pageItems.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        active={isActive(item)}
                        variant="row"
                        onNavigate={onNavigate}
                    />
                ))}
            </ul>
        </nav>
    );
}
