import { XMLParser } from 'fast-xml-parser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    siteAuthor,
    siteAuthorEmail,
    siteDescription,
    siteName,
    siteURL,
} from '@/config/constants';
import {
    getFeedData,
    renderAtomFeed,
    renderJsonFeed,
    renderRssFeed,
} from '@/lib/feed';
import { getAllArticles, getArticle } from '@/lib/posts';
import type { Article, ArticleSummary } from '@/lib/posts';

vi.mock('@/lib/posts', () => ({
    getAllArticles: vi.fn(),
    getArticle: vi.fn(),
}));

const RFC_822_DATE =
    /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;

type FeedData = Awaited<ReturnType<typeof getFeedData>>;

function summary(overrides: Partial<ArticleSummary>): ArticleSummary {
    return {
        slug: 'article',
        title: 'Article',
        description: 'An article.',
        date: '2026-01-01',
        tags: [],
        cover: '/images/articles/generated/article.svg',
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 1,
        ...overrides,
    };
}

const SUMMARIES: ArticleSummary[] = [
    summary({
        slug: 'newest',
        title: 'Newest post',
        description: 'The newest one.',
        date: '2026-08-01',
        updated: '2026-08-10',
        tags: ['Git', 'DevOps'],
        cover: '/images/articles/generated/newest.svg',
    }),
    summary({
        slug: 'older',
        title: 'Older post',
        description: 'The older one.',
        date: '2026-07-10',
        tags: ['Laravel'],
        cover: '/images/custom-cover.png',
    }),
];

function mockCorpus(summaries: ArticleSummary[]): void {
    vi.mocked(getAllArticles).mockReturnValue(summaries);
    vi.mocked(getArticle).mockImplementation(async (slug: string) => {
        const match = summaries.find((item) => item.slug === slug);
        if (!match) {
            return null;
        }
        return {
            ...match,
            html: `<p>Body of ${slug}</p>`,
            toc: [],
            learn: [],
            tech: [],
        } satisfies Article;
    });
}

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    isArray: (name) => ['item', 'entry', 'category', 'link'].includes(name),
});

/** A tiny hand-made feed with characters that need XML escaping. */
const HAND_MADE_FEED: FeedData = {
    title: 'Feeds & <Friends>',
    description: 'Tips "quoted" & \'single\'',
    updated: new Date('2026-05-02T00:00:00Z'),
    items: [
        {
            title: 'Cats & <Dogs> > Birds',
            description: 'A & B < C',
            url: 'https://example.com/a?x=1&y=2',
            imageUrl: 'https://example.com/a.png',
            tags: ['R&D', '<html>'],
            published: new Date('2026-05-01T00:00:00Z'),
            updated: new Date('2026-05-02T00:00:00Z'),
            contentHtml: '<p>Body with ]]> inside</p>',
        },
    ],
};

beforeEach(() => {
    mockCorpus(SUMMARIES);
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('getFeedData', () => {
    it('uses the site name and description for the channel', async () => {
        const data = await getFeedData();

        expect(data.title).toBe(siteName);
        expect(data.description).toBe(siteDescription);
    });

    it('builds one item per published article, keeping feed order', async () => {
        const data = await getFeedData();

        expect(data.items.map((item) => item.title)).toEqual([
            'Newest post',
            'Older post',
        ]);
    });

    it('resolves absolute article URLs on siteURL', async () => {
        const data = await getFeedData();

        expect(data.items[0].url).toBe(`${siteURL}/articles/newest`);
    });

    it('swaps SVG covers for the raster OG PNG and keeps other covers', async () => {
        const data = await getFeedData();

        expect(data.items[0].imageUrl).toBe(
            `${siteURL}/og/articles/newest.png`
        );
        expect(data.items[1].imageUrl).toBe(
            `${siteURL}/images/custom-cover.png`
        );
    });

    it('leaves an already absolute cover URL untouched', async () => {
        mockCorpus([
            summary({ slug: 'remote', cover: 'https://cdn.example.com/c.png' }),
        ]);

        const data = await getFeedData();

        expect(data.items[0].imageUrl).toBe('https://cdn.example.com/c.png');
    });

    it('parses dates as UTC midnight and falls back to date for updated', async () => {
        const data = await getFeedData();

        expect(data.items[0].published.toISOString()).toBe(
            '2026-08-01T00:00:00.000Z'
        );
        expect(data.items[0].updated.toISOString()).toBe(
            '2026-08-10T00:00:00.000Z'
        );
        expect(data.items[1].updated.toISOString()).toBe(
            '2026-07-10T00:00:00.000Z'
        );
    });

    it('includes the full rendered HTML of each article', async () => {
        const data = await getFeedData();

        expect(data.items[0].contentHtml).toBe('<p>Body of newest</p>');
    });

    it('stamps the feed with the most recent article change', async () => {
        const data = await getFeedData();

        expect(data.updated.toISOString()).toBe('2026-08-10T00:00:00.000Z');
    });

    it('stamps an empty feed with the build time', async () => {
        mockCorpus([]);
        vi.stubEnv('NEXT_PUBLIC_BUILD_TIME', '2026-09-01T12:00:00.000Z');

        const data = await getFeedData();

        expect(data.items).toEqual([]);
        expect(data.updated.toISOString()).toBe('2026-09-01T12:00:00.000Z');
    });
});

describe('renderRssFeed', () => {
    it('produces an RSS 2.0 channel with absolute links and site metadata', async () => {
        const parsed = xmlParser.parse(renderRssFeed(await getFeedData()));
        const channel = parsed.rss.channel;

        expect(parsed.rss['@_version']).toBe('2.0');
        expect(channel.title).toBe(siteName);
        expect(channel.link).toEqual([siteURL]);
        expect(channel.language).toBe('en');
        expect(channel.managingEditor).toBe(
            `${siteAuthorEmail} (${siteAuthor})`
        );
        expect(channel.lastBuildDate).toMatch(RFC_822_DATE);
        expect(channel['atom:link']['@_href']).toBe(`${siteURL}/feed.xml`);
        expect(channel['atom:link']['@_rel']).toBe('self');
    });

    it('emits one item per published article with the expected fields', async () => {
        const parsed = xmlParser.parse(renderRssFeed(await getFeedData()));
        const items = parsed.rss.channel.item;

        expect(items).toHaveLength(SUMMARIES.length);
        const [first] = items;
        expect(first.title).toBe('Newest post');
        expect(first.link).toEqual([`${siteURL}/articles/newest`]);
        expect(first.guid['#text']).toBe(`${siteURL}/articles/newest`);
        expect(first.guid['@_isPermaLink']).toBe('true');
        expect(first.pubDate).toBe('Sat, 01 Aug 2026 00:00:00 GMT');
        expect(first.pubDate).toMatch(RFC_822_DATE);
        expect(first.description).toBe('The newest one.');
        expect(first.category).toEqual(['Git', 'DevOps']);
        expect(first['content:encoded'].__cdata).toBe('<p>Body of newest</p>');
    });

    it('produces a valid empty channel when there are no articles', async () => {
        mockCorpus([]);

        const parsed = xmlParser.parse(renderRssFeed(await getFeedData()));

        expect(parsed.rss.channel.title).toBe(siteName);
        expect(parsed.rss.channel.item).toBeUndefined();
    });

    it('escapes & < > in text and splits ]]> inside CDATA', () => {
        const xml = renderRssFeed(HAND_MADE_FEED);

        expect(xml).toContain('<title>Feeds &amp; &lt;Friends&gt;</title>');
        expect(xml).toContain(
            '<title>Cats &amp; &lt;Dogs&gt; &gt; Birds</title>'
        );
        expect(xml).toContain('<category>R&amp;D</category>');
        expect(xml).toContain('<category>&lt;html&gt;</category>');
        expect(xml).toContain(
            '<description>Tips &quot;quoted&quot; &amp; &apos;single&apos;</description>'
        );
        expect(xml).toContain(
            '<![CDATA[<p>Body with ]]]]><![CDATA[> inside</p>]]>'
        );

        const parsed = xmlParser.parse(xml);
        const [item] = parsed.rss.channel.item;
        expect(parsed.rss.channel.title).toBe('Feeds & <Friends>');
        expect(item.title).toBe('Cats & <Dogs> > Birds');
        expect(item.link).toEqual(['https://example.com/a?x=1&y=2']);
    });
});

describe('renderAtomFeed', () => {
    it('produces an Atom feed with self link, author, and RFC 3339 updated', async () => {
        const parsed = xmlParser.parse(renderAtomFeed(await getFeedData()));
        const feed = parsed.feed;

        expect(feed['@_xmlns']).toBe('http://www.w3.org/2005/Atom');
        expect(feed.id).toBe(`${siteURL}/`);
        expect(feed.title).toBe(siteName);
        expect(feed.updated).toBe('2026-08-10T00:00:00.000Z');
        expect(feed.author).toEqual({
            name: siteAuthor,
            email: siteAuthorEmail,
        });
        expect(
            feed.link.map((link: Record<string, string>) => link['@_href'])
        ).toEqual([siteURL, `${siteURL}/atom.xml`]);
    });

    it('emits one entry per published article with the expected fields', async () => {
        const parsed = xmlParser.parse(renderAtomFeed(await getFeedData()));
        const entries = parsed.feed.entry;

        expect(entries).toHaveLength(SUMMARIES.length);
        const [first] = entries;
        expect(first.id).toBe(`${siteURL}/articles/newest`);
        expect(first.title).toBe('Newest post');
        expect(first.link[0]['@_href']).toBe(`${siteURL}/articles/newest`);
        expect(first.published).toBe('2026-08-01T00:00:00.000Z');
        expect(first.updated).toBe('2026-08-10T00:00:00.000Z');
        expect(first.summary).toBe('The newest one.');
        expect(
            first.category.map(
                (category: Record<string, string>) => category['@_term']
            )
        ).toEqual(['Git', 'DevOps']);
        expect(first.content['@_type']).toBe('html');
        expect(first.content.__cdata).toBe('<p>Body of newest</p>');
    });

    it('escapes & < > in titles and attribute values', () => {
        const xml = renderAtomFeed(HAND_MADE_FEED);

        expect(xml).toContain(
            '<title>Cats &amp; &lt;Dogs&gt; &gt; Birds</title>'
        );
        expect(xml).toContain('<category term="R&amp;D"/>');
        expect(xml).toContain(
            '<link href="https://example.com/a?x=1&amp;y=2"/>'
        );
        expect(() => xmlParser.parse(xml)).not.toThrow();
    });
});

describe('renderJsonFeed', () => {
    it('produces a JSON Feed 1.1 document with site metadata', async () => {
        const feed = JSON.parse(renderJsonFeed(await getFeedData()));

        expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
        expect(feed.title).toBe(siteName);
        expect(feed.description).toBe(siteDescription);
        expect(feed.home_page_url).toBe(siteURL);
        expect(feed.feed_url).toBe(`${siteURL}/feed.json`);
        expect(feed.language).toBe('en');
        expect(feed.authors).toEqual([{ name: siteAuthor, url: siteURL }]);
    });

    it('emits one item per published article with the expected fields', async () => {
        const feed = JSON.parse(renderJsonFeed(await getFeedData()));

        expect(feed.items).toHaveLength(SUMMARIES.length);
        expect(feed.items[0]).toEqual({
            id: `${siteURL}/articles/newest`,
            url: `${siteURL}/articles/newest`,
            title: 'Newest post',
            summary: 'The newest one.',
            content_html: '<p>Body of newest</p>',
            image: `${siteURL}/og/articles/newest.png`,
            date_published: '2026-08-01T00:00:00.000Z',
            date_modified: '2026-08-10T00:00:00.000Z',
            tags: ['Git', 'DevOps'],
        });
    });

    it('keeps raw text (no XML escaping) and ends with a newline', () => {
        const json = renderJsonFeed(HAND_MADE_FEED);
        const feed = JSON.parse(json);

        expect(json.endsWith('}\n')).toBe(true);
        expect(feed.items[0].title).toBe('Cats & <Dogs> > Birds');
        expect(feed.items[0].content_html).toBe('<p>Body with ]]> inside</p>');
    });
});
