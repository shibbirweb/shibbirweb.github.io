import { describe, expect, it } from 'vitest';
import { siteName, siteThumbnail, siteURL } from '@/config/constants';
import type { Article } from '@/lib/posts';
import { buildArticleJsonLd } from '@/utils/articleJsonLd';

function article(overrides: Partial<Article> = {}): Article {
    return {
        slug: 'my-post',
        title: 'My post',
        description: 'What it is about',
        date: '2026-08-01',
        tags: ['Git', 'Version Control'],
        cover: '/images/articles/generated/my-post.svg',
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 7,
        html: '<p>One two <strong>three</strong></p><p>four</p>',
        toc: [],
        learn: [],
        tech: ['Git', 'Bash'],
        ...overrides,
    };
}

type JsonLdRecord = Record<string, unknown>;

function build(overrides: Partial<Article> = {}): JsonLdRecord {
    return buildArticleJsonLd(article(overrides)) as unknown as JsonLdRecord;
}

describe('buildArticleJsonLd', () => {
    it('declares a BlogPosting at the absolute article URL', () => {
        const jsonLd = build();
        expect(jsonLd['@context']).toBe('https://schema.org');
        expect(jsonLd['@type']).toBe('BlogPosting');
        expect(jsonLd.url).toBe(`${siteURL}/articles/my-post`);
        expect(jsonLd.mainEntityOfPage).toEqual({
            '@type': 'WebPage',
            '@id': `${siteURL}/articles/my-post`,
        });
    });

    it('uses the title and description as headline and description', () => {
        const jsonLd = build();
        expect(jsonLd.headline).toBe('My post');
        expect(jsonLd.description).toBe('What it is about');
    });

    it('falls back to the publish date when there is no updated date', () => {
        const jsonLd = build();
        expect(jsonLd.datePublished).toBe('2026-08-01');
        expect(jsonLd.dateModified).toBe('2026-08-01');
    });

    it('uses the updated date as dateModified when present', () => {
        expect(build({ updated: '2026-08-09' }).dateModified).toBe(
            '2026-08-09'
        );
    });

    it('points an SVG cover at its raster OG image', () => {
        expect(build().image).toBe(`${siteURL}/og/articles/my-post.png`);
    });

    it('uses a raster cover as-is', () => {
        expect(build({ cover: '/images/articles/photo.jpg' }).image).toBe(
            `${siteURL}/images/articles/photo.jpg`
        );
    });

    it('falls back to the site thumbnail without a cover', () => {
        expect(build({ cover: '' }).image).toBe(siteThumbnail);
    });

    it('expresses reading time as an ISO 8601 duration', () => {
        expect(build().timeRequired).toBe('PT7M');
    });

    it('counts words in the rendered HTML with tags stripped', () => {
        expect(build().wordCount).toBe(4);
    });

    it('omits wordCount for an empty body', () => {
        expect(build({ html: '<p> </p>' })).not.toHaveProperty('wordCount');
    });

    it('merges tags and tech into de-duplicated keywords', () => {
        expect(build().keywords).toBe('Git, Version Control, Bash');
    });

    it('omits keywords when there are no tags or tech', () => {
        expect(build({ tags: [], tech: [] })).not.toHaveProperty('keywords');
    });

    it('uses the category as articleSection only when set', () => {
        expect(build({ category: 'Backend' }).articleSection).toBe('Backend');
        expect(build()).not.toHaveProperty('articleSection');
    });

    it('links the author and publisher to the site Person entity', () => {
        const jsonLd = build();
        expect(jsonLd.author).toMatchObject({
            '@type': 'Person',
            '@id': `${siteURL}#person`,
            name: siteName,
        });
        expect(jsonLd.publisher).toMatchObject({
            '@id': `${siteURL}#person`,
            name: siteName,
        });
    });
});
