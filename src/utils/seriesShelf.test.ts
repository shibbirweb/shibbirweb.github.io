import { describe, expect, it } from 'vitest';
import { buildSeriesShelf } from '@/utils/seriesShelf';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(
    slug: string,
    extra: Partial<ArticleSummary> & { tech?: string[] } = {}
): ArticleSummary & { tech?: string[] } {
    return {
        slug,
        title: `Title of ${slug}`,
        description: '',
        date: '2026-01-10',
        tags: [],
        cover: `/images/articles/${slug}.svg`,
        coverColors: [`#${slug.length}00000`, '#ffffff'],
        readingMinutes: 5,
        ...extra,
    };
}

const webhooksPartTwo = buildArticle('twilio', {
    date: '2026-11-16',
    readingMinutes: 8,
    tags: ['Laravel', 'Twilio', 'SendMock'],
    tech: ['Laravel', 'PHP', 'Twilio'],
    coverColors: ['#222222', '#ffffff'],
    series: { name: 'Webhooks', order: 2 },
});
const webhooksPartOne = buildArticle('mailgun', {
    date: '2026-11-15',
    readingMinutes: 8,
    tags: ['Laravel', 'Mailgun', 'SendMock'],
    tech: ['Laravel', 'PHP', 'Mailgun'],
    coverColors: ['#111111', '#ffffff'],
    series: { name: 'Webhooks', order: 1 },
});
const homelab = buildArticle('dns', {
    date: '2026-08-01',
    updated: '2026-12-01',
    series: { name: 'Home lab', order: 1 },
});
const standalone = buildArticle('git', { date: '2026-12-30' });

describe('buildSeriesShelf', () => {
    const shelf = buildSeriesShelf([
        webhooksPartTwo,
        standalone,
        homelab,
        webhooksPartOne,
    ]);
    const webhooks = shelf.find((entry) => entry.name === 'Webhooks');

    it('groups articles into series and leaves standalone ones out', () => {
        expect(shelf.map((entry) => entry.name).sort()).toEqual([
            'Home lab',
            'Webhooks',
        ]);
    });

    it('lists the parts in reading order with their covers', () => {
        expect(webhooks?.parts).toEqual([
            {
                slug: 'mailgun',
                title: 'Title of mailgun',
                cover: '/images/articles/mailgun.svg',
            },
            {
                slug: 'twilio',
                title: 'Title of twilio',
                cover: '/images/articles/twilio.svg',
            },
        ]);
    });

    it('adds up the reading time and takes the first part colours', () => {
        expect(webhooks?.readingMinutes).toBe(16);
        expect(webhooks?.accentColors).toEqual(['#111111', '#ffffff']);
    });

    it('puts the most recently published or updated series first', () => {
        // Home lab was published earlier but updated after the newest part.
        expect(shelf.map((entry) => entry.name)).toEqual([
            'Home lab',
            'Webhooks',
        ]);
        expect(shelf[0].latestDate).toBe('2026-12-01');
        expect(webhooks?.latestDate).toBe('2026-11-16');
    });

    it('merges the tags, shared ones first, then in reading order', () => {
        expect(webhooks?.tags).toEqual([
            'Laravel',
            'SendMock',
            'Mailgun',
            'Twilio',
        ]);
    });

    it('merges the tech stacks in reading order without repeats', () => {
        expect(webhooks?.tech).toEqual(['Laravel', 'PHP', 'Mailgun', 'Twilio']);
    });

    it('leaves the stack empty when the articles carry none', () => {
        expect(shelf.find((entry) => entry.name === 'Home lab')?.tech).toEqual(
            []
        );
    });

    it('returns nothing when no article is in a series', () => {
        expect(buildSeriesShelf([standalone])).toEqual([]);
    });
});
