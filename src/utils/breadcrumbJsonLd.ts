import { BreadcrumbList, WithContext } from 'schema-dts';
import { siteURL } from '@/config/constants';
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb/types';

export function buildBreadcrumbJsonLd(
    items: BreadcrumbItem[]
): WithContext<BreadcrumbList> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name ?? item.label,
            item: `${siteURL}${item.href}`,
        })),
    };
}
