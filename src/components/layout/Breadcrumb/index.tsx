'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { jetBrainsMono } from '@/config/fonts';
import { cn } from '@/utils/cn';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/utils/breadcrumbJsonLd';
import BreadcrumbItem from '@/components/layout/Breadcrumb/BreadcrumbItem';
import type { BreadcrumbItem as BreadcrumbItemData } from '@/components/layout/Breadcrumb/types';

/** Turn a URL segment into a human-readable name, e.g. `home-lab` -> `Home Lab`. */
function toReadableName(segment: string): string {
    return decodeURIComponent(segment)
        .split('-')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

interface BreadcrumbProps {
    /**
     * Human-readable name for the current page in the JSON-LD, used when the URL
     * slug alone is not descriptive (e.g. an article title). The visible crumb
     * still shows the slug to keep the terminal-path look.
     */
    currentName?: string;
}

/**
 * Terminal-path breadcrumb (e.g. `~ › articles › redis-caching-strategies`)
 * shown on every page except home. It derives the trail from the current route,
 * so new pages get a breadcrumb automatically with no per-page configuration.
 * Rendered in JetBrains Mono with chevrons instead of slashes, and emits
 * BreadcrumbList JSON-LD in production.
 */
export default function Breadcrumb({ currentName }: BreadcrumbProps) {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Home (no path segments) intentionally has no breadcrumb.
    if (segments.length === 0) return null;

    const items: BreadcrumbItemData[] = [
        { label: '~', href: '/', name: 'Home' },
        ...segments.map((segment, index) => ({
            label: decodeURIComponent(segment),
            href: `/${segments.slice(0, index + 1).join('/')}`,
            name: toReadableName(segment),
        })),
    ];

    if (currentName) items[items.length - 1].name = currentName;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn(
                jetBrainsMono.variable,
                'text-foreground/60 mb-6 font-mono text-sm sm:text-base'
            )}
        >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {items.map((item, index) => (
                    <Fragment key={item.href}>
                        {index > 0 && (
                            <li
                                aria-hidden="true"
                                className="text-foreground/30 select-none"
                            >
                                ›
                            </li>
                        )}
                        <li>
                            <BreadcrumbItem
                                item={item}
                                isCurrent={index === items.length - 1}
                            />
                        </li>
                    </Fragment>
                ))}
            </ol>

            {process.env.NODE_ENV === 'production' && (
                <JsonLd data={buildBreadcrumbJsonLd(items)} />
            )}
        </nav>
    );
}
