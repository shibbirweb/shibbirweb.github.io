import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { NavItemData } from '@/components/layout/Navbar/contents';

interface NavItemProps {
    item: NavItemData;
    active: boolean;
    /** `pill` for the desktop bar, `row` for the mobile dropdown list. */
    variant?: 'pill' | 'row';
    onNavigate?: () => void;
}

export default function NavItem({
    item,
    active,
    variant = 'pill',
    onNavigate,
}: NavItemProps) {
    const className = cn(
        'block text-lg transition-colors',
        variant === 'pill'
            ? 'rounded-full px-4 py-1.5'
            : 'hover:bg-foreground/5 rounded-xl px-4 py-2.5',
        active
            ? 'bg-foreground/10 text-foreground font-semibold'
            : 'text-foreground/70 hover:text-foreground'
    );

    // External items (e.g. the resume PDF) open in a new tab via a plain anchor
    // rather than a client-side route transition.
    if (item.external) {
        return (
            <li>
                <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onNavigate}
                    className={className}
                >
                    {item.label}
                </a>
            </li>
        );
    }

    return (
        <li>
            <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
                className={className}
            >
                {item.label}
            </Link>
        </li>
    );
}
