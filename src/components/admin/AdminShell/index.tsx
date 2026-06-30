'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { type IconName } from '@/components/admin/ui/Icon';
import Chip from '@/components/admin/ui/Chip';
import { cn } from '@/utils/cn';

interface StudioModule {
    label: string;
    href: string;
    icon: IconName;
    enabled: boolean;
}

// The Admin section is built to host future modules (see issue #100). Only
// Articles is wired up today; the rest are shown as a deliberate roadmap.
const MODULES: StudioModule[] = [
    { label: 'Articles', href: '/admin/articles', icon: 'file', enabled: true },
    { label: 'Projects', href: '#', icon: 'layers', enabled: false },
    { label: 'Media', href: '#', icon: 'image', enabled: false },
    { label: 'Homepage', href: '#', icon: 'star', enabled: false },
    { label: 'Settings', href: '#', icon: 'settings', enabled: false },
];

/**
 * Shared chrome for the Article Studio's hub and dashboard: the brand header,
 * a "back to site" link, and the module rail. The editor uses its own focused
 * top bar instead, so it is intentionally not wrapped by this shell.
 */
export default function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="container mx-auto px-4 pt-24 pb-16">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <Link href="/admin" className="group flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
                        <Icon name="sparkles" className="size-5" />
                    </span>
                    <span>
                        <span className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight">
                                Article Studio
                            </span>
                            <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-amber-600 uppercase dark:text-amber-400">
                                Dev only
                            </span>
                        </span>
                        <span className="text-foreground/55 block text-xs">
                            Local content workspace, no database
                        </span>
                    </span>
                </Link>

                <Link
                    href="/articles"
                    className="text-foreground/60 hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                >
                    <Icon name="external" className="size-4" />
                    View live articles
                </Link>
            </header>

            <nav
                aria-label="Studio modules"
                className="border-foreground/10 mt-6 flex flex-wrap gap-1 border-b pb-px"
            >
                {MODULES.map((module) => {
                    const active =
                        module.enabled && pathname.startsWith(module.href);
                    const content = (
                        <>
                            <Icon name={module.icon} className="size-4" />
                            {module.label}
                            {!module.enabled && <Chip className="ml-1">Soon</Chip>}
                        </>
                    );
                    const className = cn(
                        '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                            ? 'border-violet-500 text-foreground'
                            : 'border-transparent text-foreground/55',
                        module.enabled
                            ? 'hover:text-foreground cursor-pointer'
                            : 'cursor-not-allowed'
                    );
                    return module.enabled ? (
                        <Link
                            key={module.label}
                            href={module.href}
                            className={className}
                        >
                            {content}
                        </Link>
                    ) : (
                        <span
                            key={module.label}
                            aria-disabled
                            className={className}
                        >
                            {content}
                        </span>
                    );
                })}
            </nav>

            <main className="mt-8">{children}</main>
        </div>
    );
}
