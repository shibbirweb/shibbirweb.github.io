'use client';

import { useContext } from 'react';
import { MenuContext } from '@/components/admin/ui/Menu/context';
import Icon, { type IconName } from '@/components/admin/ui/Icon';
import { cn } from '@/utils/cn';

/** A single action row in a Menu. Closes the menu after running its handler. */
export default function MenuItem({
    icon,
    onClick,
    danger = false,
    children,
}: {
    icon?: IconName;
    onClick: () => void;
    danger?: boolean;
    children: React.ReactNode;
}) {
    const close = useContext(MenuContext);
    return (
        <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
                close();
                onClick();
            }}
            className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none',
                danger
                    ? 'text-red-600 hover:bg-red-600/10 focus-visible:bg-red-600/10 dark:text-red-400'
                    : 'text-foreground/80 hover:bg-foreground/[0.07] focus-visible:bg-foreground/[0.07] hover:text-foreground'
            )}
        >
            {icon && <Icon name={icon} className="size-4" />}
            {children}
        </button>
    );
}
