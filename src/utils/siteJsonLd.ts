import { WithContext, WebSite, ItemList } from 'schema-dts';

import {
    siteURL,
    siteName,
    jsonLdAlternateName,
    jsonLdDescription,
} from '@/config/constants';
import {
    sectionItems,
    articlesItem,
    pageItems,
    resumeItem,
} from '@/components/layout/Navbar/contents';

/** Join a navbar href (e.g. '/#about', '/uses') onto the absolute site URL. */
const toAbsoluteUrl = (href: string): string =>
    `${siteURL}${href.startsWith('/') ? href : `/${href}`}`;

/**
 * Site-level WebSite entity. Its publisher references the Person emitted (with
 * the same @id) by the ProfilePage block in @/utils/jsonLd, so both JSON-LD
 * scripts on the page resolve into one linked entity graph.
 */
export const websiteJsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteURL}#website`,
    url: siteURL,
    name: siteName,
    alternateName: jsonLdAlternateName,
    description: jsonLdDescription,
    inLanguage: 'en',
    publisher: {
        '@id': `${siteURL}#person`,
    },
};

// Primary navigation, reusing the navbar's own definitions as the single source
// of truth (dev-only studioItems are intentionally excluded).
const navigationItems = [
    ...sectionItems,
    articlesItem,
    ...pageItems,
    resumeItem,
];

/** Declares the primary navigation as SiteNavigationElement candidates. */
export const siteNavigationJsonLd: WithContext<ItemList> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteURL}#nav`,
    name: 'Primary navigation',
    itemListElement: navigationItems.map((item, index) => ({
        '@type': 'SiteNavigationElement',
        position: index + 1,
        name: item.label,
        url: toAbsoluteUrl(item.href),
    })),
};
