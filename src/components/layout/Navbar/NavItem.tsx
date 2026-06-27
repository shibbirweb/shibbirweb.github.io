import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { NavItemData } from './contents';

interface NavItemProps {
    item: NavItemData;
    active: boolean;
}

export default function NavItem({ item, active }: NavItemProps) {
    return (
        <li>
            <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'block rounded-full px-4 py-1.5 text-lg transition-colors',
                    active
                        ? 'bg-foreground/10 text-foreground font-semibold'
                        : 'text-foreground/70 hover:text-foreground'
                )}
            >
                {item.label}
            </Link>
        </li>
    );
}
