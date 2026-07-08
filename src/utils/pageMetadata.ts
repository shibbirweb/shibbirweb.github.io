import type { Metadata } from 'next';
import { defaultThumbnail, siteName } from '@/config/constants';

type PageMetadataInput = {
    /** Page title, e.g. 'Uses'. The root layout appends '| Shibbir Ahmed'. */
    title: string;
    description: string;
    /** Canonical path for the route, e.g. '/uses'. */
    path: string;
    /**
     * Overrides the default share card. Omit to inherit the site-wide default
     * (`defaultThumbnail`); pages that ship a purpose-built image pass their own.
     */
    image?: { url: string; alt?: string };
    robots?: Metadata['robots'];
};

/**
 * Single source of truth for page-level metadata. Next.js does not deep-merge a
 * page's `openGraph`/`twitter` with the layout, so any page that sets its own
 * OpenGraph loses the inherited share image. Routing every page through this
 * helper keeps the default OG image (`defaultThumbnail`) applied automatically,
 * so new pages get it for free and only overrides need to pass an `image`.
 */
export function buildPageMetadata({
    title,
    description,
    path,
    image,
    robots,
}: PageMetadataInput): Metadata {
    const imageUrl = image?.url ?? defaultThumbnail;
    const imageAlt = image?.alt ?? `${title} | ${siteName}`;
    return {
        title,
        description,
        alternates: { canonical: path },
        ...(robots && { robots }),
        openGraph: {
            title: `${title} | ${siteName}`,
            description,
            url: path,
            siteName,
            type: 'website',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: imageAlt,
                    type: 'image/png',
                },
            ],
        },
        twitter: {
            images: [imageUrl],
        },
    };
}
