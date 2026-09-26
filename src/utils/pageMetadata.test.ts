import { describe, expect, it } from 'vitest';
import { defaultThumbnail, siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

type ImageEntry = { url: string; alt: string; width: number; height: number };

describe('buildPageMetadata', () => {
    const metadata = buildPageMetadata({
        title: 'Uses',
        description: 'My setup',
        path: '/uses',
    });

    it('passes through the title and description', () => {
        expect(metadata.title).toBe('Uses');
        expect(metadata.description).toBe('My setup');
    });

    it('sets the canonical URL to the route path', () => {
        expect(metadata.alternates?.canonical).toBe('/uses');
    });

    it('builds OpenGraph with the suffixed title and route URL', () => {
        expect(metadata.openGraph).toMatchObject({
            title: `Uses | ${siteName}`,
            description: 'My setup',
            url: '/uses',
            siteName,
            type: 'website',
        });
    });

    it('falls back to the default share image with a 1200x630 card', () => {
        const images = metadata.openGraph?.images as ImageEntry[];
        expect(images).toHaveLength(1);
        expect(images[0]).toMatchObject({
            url: defaultThumbnail,
            width: 1200,
            height: 630,
            alt: `Uses | ${siteName}`,
        });
        expect(metadata.twitter?.images).toEqual([defaultThumbnail]);
    });

    it('uses an override image for both OpenGraph and Twitter', () => {
        const withImage = buildPageMetadata({
            title: 'Resume',
            description: 'CV',
            path: '/resume',
            image: { url: 'https://example.com/card.png', alt: 'Resume card' },
        });
        const images = withImage.openGraph?.images as ImageEntry[];
        expect(images[0].url).toBe('https://example.com/card.png');
        expect(images[0].alt).toBe('Resume card');
        expect(withImage.twitter?.images).toEqual([
            'https://example.com/card.png',
        ]);
    });

    it('derives the alt text from the title when an override omits it', () => {
        const withImage = buildPageMetadata({
            title: 'Now',
            description: 'Lately',
            path: '/now',
            image: { url: 'https://example.com/now.png' },
        });
        const images = withImage.openGraph?.images as ImageEntry[];
        expect(images[0].alt).toBe(`Now | ${siteName}`);
    });

    it('passes robots through only when given', () => {
        expect(metadata).not.toHaveProperty('robots');
        const hidden = buildPageMetadata({
            title: 'Offline',
            description: 'Offline page',
            path: '/network-status',
            robots: { index: false, follow: false },
        });
        expect(hidden.robots).toEqual({ index: false, follow: false });
    });
});
