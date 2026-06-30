import Link from 'next/link';
import Icon, { type IconName } from '@/components/admin/ui/Icon';
import Chip from '@/components/admin/ui/Chip';
import { cn } from '@/utils/cn';

interface ModuleCard {
    label: string;
    description: string;
    href?: string;
    icon: IconName;
    note?: string;
}

const MODULES: ModuleCard[] = [
    {
        label: 'Articles',
        description:
            'Write, preview, and publish Markdown articles with a visual editor and a production-exact preview.',
        href: '/admin/articles',
        icon: 'file',
    },
    {
        label: 'Projects',
        description:
            'Curate the featured projects grid without hand-editing the contents file.',
        icon: 'layers',
        note: 'Planned',
    },
    {
        label: 'Media Library',
        description:
            'Browse and manage the images that live under public/images.',
        icon: 'image',
        note: 'Planned',
    },
    {
        label: 'Homepage Content',
        description: 'Tune the hero, about, and skills copy from one place.',
        icon: 'star',
        note: 'Planned',
    },
    {
        label: 'Resume',
        description: 'Swap the resume PDF and keep its metadata in sync.',
        icon: 'file',
        note: 'Planned',
    },
    {
        label: 'Settings',
        description: 'Studio preferences and site-wide configuration.',
        icon: 'settings',
        note: 'Planned',
    },
];

export default function Overview() {
    return (
        <div>
            <section className="border-foreground/10 from-violet-500/[0.07] relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-6 sm:p-8">
                <h1 className="text-2xl font-bold sm:text-3xl">
                    Welcome to the Studio
                </h1>
                <p className="text-foreground/70 mt-2 max-w-2xl">
                    A local content workspace for this portfolio. Markdown files
                    stay the single source of truth: the Studio just gives you a
                    faster, friendlier way to author them. It runs only in
                    development and never ships to the live site.
                </p>
                <Link
                    href="/admin/articles"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-500"
                >
                    <Icon name="file" className="size-4" />
                    Open Articles
                </Link>
            </section>

            <h2 className="text-foreground/70 mt-10 text-xs font-semibold tracking-wider uppercase">
                Modules
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MODULES.map((module) => {
                    const inner = (
                        <>
                            <div className="flex items-center justify-between">
                                <span
                                    className={cn(
                                        'grid size-10 place-items-center rounded-xl',
                                        module.href
                                            ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                                            : 'bg-foreground/[0.06] text-foreground/40'
                                    )}
                                >
                                    <Icon name={module.icon} className="size-5" />
                                </span>
                                {module.note && <Chip>{module.note}</Chip>}
                            </div>
                            <h3 className="mt-4 font-semibold">{module.label}</h3>
                            <p className="text-foreground/60 mt-1 text-sm leading-relaxed">
                                {module.description}
                            </p>
                        </>
                    );
                    const className = cn(
                        'rounded-2xl border border-foreground/10 p-5 transition-colors',
                        module.href
                            ? 'hover:border-foreground/25 hover:bg-foreground/[0.02]'
                            : 'opacity-70'
                    );
                    return module.href ? (
                        <Link
                            key={module.label}
                            href={module.href}
                            className={className}
                        >
                            {inner}
                        </Link>
                    ) : (
                        <div
                            key={module.label}
                            className={className}
                            aria-disabled
                        >
                            {inner}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
