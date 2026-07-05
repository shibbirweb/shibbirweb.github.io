'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import Chevron from '@/components/icons/chevron';
import type { NavItemData } from '@/components/layout/Navbar/contents';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';
import { useCloseOnEscape } from '@/components/layout/Navbar/hooks/useCloseOnEscape';
import { useCloseOnClickOutside } from '@/components/layout/Navbar/hooks/useCloseOnClickOutside';
import { useCloseOnRouteChange } from '@/components/layout/Navbar/hooks/useCloseOnRouteChange';

interface StudioMenuProps {
    items: NavItemData[];
    isActive: (item: NavItemData) => boolean;
}

/**
 * Desktop pill dropdown grouping the dev-only authoring tools. Rendered only
 * when `items` is non-empty (the Navbar passes an empty list in production), so
 * the built site never shows it.
 */
export default function StudioMenu({ items, isActive }: StudioMenuProps) {
    const { open, show, toggle, close } = useDisclosure();
    const menuRef = useRef<HTMLLIElement>(null);
    useCloseOnEscape(open, close);
    useCloseOnClickOutside(menuRef, open, close);
    useCloseOnRouteChange(close);

    const groupActive = items.some(isActive);

    // Hover opens on desktop; the click toggle stays for keyboard and touch.
    return (
        <li
            ref={menuRef}
            className="relative flex items-center"
            onMouseEnter={show}
            onMouseLeave={close}
        >
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                className={cn(
                    'flex cursor-pointer items-center gap-1 rounded-full py-1.5 pr-2 pl-3 text-sm transition-colors',
                    open || groupActive
                        ? 'bg-foreground/10 text-foreground font-semibold'
                        : 'text-foreground/70 hover:text-foreground'
                )}
            >
                Studio
                <Chevron
                    aria-hidden="true"
                    className={cn(
                        'size-4 transition-transform duration-200',
                        open ? 'rotate-0' : 'rotate-180'
                    )}
                />
            </button>
            {/*
             * The pt-2 wrapper is a transparent hover bridge over the visual gap
             * to the panel, so the pointer can cross from the button to the menu
             * without leaving the <li> and closing it.
             */}
            <div
                className={cn(
                    'absolute top-full right-0 pt-2',
                    open ? '' : 'pointer-events-none'
                )}
            >
                <div
                    role="menu"
                    className={cn(
                        'border-foreground/10 bg-background/70 w-48 origin-top-right rounded-2xl border p-2 shadow-xl shadow-black/10 backdrop-blur-lg transition-all duration-200 ease-out',
                        open
                            ? 'visible scale-100 opacity-100'
                            : 'invisible scale-95 opacity-0'
                    )}
                >
                    <ul className="flex flex-col gap-0.5">
                        {items.map((item) => (
                            <li
                                key={item.href}
                                role="none"
                            >
                                <Link
                                    role="menuitem"
                                    href={item.href}
                                    aria-current={
                                        isActive(item) ? 'page' : undefined
                                    }
                                    onClick={close}
                                    className={cn(
                                        'block rounded-xl px-4 py-2.5 text-sm transition-colors',
                                        isActive(item)
                                            ? 'bg-foreground/10 text-foreground font-semibold'
                                            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </li>
    );
}
