'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { MenuContext } from '@/components/admin/ui/Menu/context';
import { useMenuKeyboard } from '@/components/admin/ui/Menu/hooks/useMenuKeyboard';
import { useCloseOnOutsideClick } from '@/components/admin/ui/hooks/useCloseOnOutsideClick';
import Icon, { type IconName } from '@/components/admin/ui/Icon';
import { iconButtonClasses } from '@/components/admin/ui/Button';
import { cn } from '@/utils/cn';

export { default as MenuItem } from '@/components/admin/ui/Menu/MenuItem';

/**
 * A click-to-open dropdown for per-row and editor actions. Closes on outside
 * click, Escape, or item selection, with full keyboard menu semantics. It is
 * positioned relative to its trigger, so the surrounding row must not clip
 * overflow.
 */
export default function Menu({
    label = 'Actions',
    align = 'right',
    triggerIcon = 'more',
    triggerClassName,
    children,
}: {
    label?: string;
    align?: 'left' | 'right';
    triggerIcon?: IconName;
    triggerClassName?: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();

    const close = useCallback(() => setOpen(false), []);
    useCloseOnOutsideClick(open, containerRef, close);
    const onKeyDown = useMenuKeyboard(open, panelRef, () => {
        setOpen(false);
        triggerRef.current?.focus();
    });

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={label}
                onClick={() => setOpen((value) => !value)}
                className={iconButtonClasses(cn('size-8', triggerClassName))}
            >
                <Icon name={triggerIcon} className="size-4" />
            </button>
            {open && (
                <div
                    id={menuId}
                    ref={panelRef}
                    role="menu"
                    aria-label={label}
                    onKeyDown={onKeyDown}
                    className={cn(
                        'bg-background absolute top-full z-30 mt-1 min-w-44 overflow-hidden rounded-xl border border-foreground/10 p-1 shadow-xl',
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    <MenuContext.Provider value={close}>
                        {children}
                    </MenuContext.Provider>
                </div>
            )}
        </div>
    );
}
