import type { SeriesShelfEntry } from '@/utils/seriesShelf';

/** A two-part series entry for component tests, with any field overridden. */
export function buildSeriesEntry(
    overrides: Partial<SeriesShelfEntry> = {}
): SeriesShelfEntry {
    return {
        name: 'Local Webhooks',
        parts: [
            {
                slug: 'mailgun-webhooks',
                title: 'Mailgun webhooks',
                cover: '/images/articles/mailgun-webhooks.svg',
            },
            {
                slug: 'twilio-webhooks',
                title: 'Twilio webhooks',
                cover: '/images/articles/twilio-webhooks.svg',
            },
        ],
        readingMinutes: 16,
        accentColors: ['#111111', '#222222'],
        latestDate: '2026-11-16',
        tags: ['Laravel', 'SendMock'],
        tech: ['Laravel', 'PHP'],
        ...overrides,
    };
}
