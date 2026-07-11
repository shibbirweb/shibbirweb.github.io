// Build-time feed generation. Assembles the published-article corpus once into a
// format-neutral model, then serialises it to RSS 2.0, Atom 1.0, and JSON Feed
// 1.1. Everything resolves statically so the three route handlers can be exported
// as files by `output: 'export'`. Channel/author values come from
// `@/config/constants` (never hardcoded), and every link/image is absolute.

import {
    siteAuthor,
    siteAuthorEmail,
    siteDescription,
    siteName,
    siteURL,
} from '@/config/constants';
import { articleOgImagePath } from '@/utils/generateArticleCover';
import { getAllArticles, getArticle } from '@/lib/posts';

/** One article as a feed entry, with absolute URLs and parsed dates. */
interface FeedItem {
    title: string;
    description: string;
    url: string;
    imageUrl: string;
    tags: string[];
    published: Date;
    updated: Date;
    contentHtml: string;
}

/** The format-neutral feed model shared by all three serialisers. */
interface FeedData {
    title: string;
    description: string;
    updated: Date;
    items: FeedItem[];
}

/** Absolute URL for a public path, rooted at the configured site URL. */
function absoluteUrl(pathOrUrl: string): string {
    return pathOrUrl.startsWith('http') ? pathOrUrl : `${siteURL}${pathOrUrl}`;
}

/** Parse a `YYYY-MM-DD` frontmatter date the same way the sitemap does. */
function parseDate(value: string): Date {
    return new Date(`${value}T00:00:00`);
}

/**
 * Assemble the feed model from every published article (newest first), loading
 * full rendered HTML through the same pipeline the article pages use. Returns a
 * valid model with zero items when there are no articles yet.
 */
export async function getFeedData(): Promise<FeedData> {
    const summaries = getAllArticles();

    const items = await Promise.all(
        summaries.map<Promise<FeedItem>>(async (summary) => {
            const article = await getArticle(summary.slug);
            // Social/reader clients do not render SVG, so point at the raster OG
            // PNG for generated SVG covers (same choice the sitemap makes).
            const image = summary.cover.endsWith('.svg')
                ? articleOgImagePath(summary.slug)
                : summary.cover;
            return {
                title: summary.title,
                description: summary.description,
                url: absoluteUrl(`/articles/${summary.slug}`),
                imageUrl: absoluteUrl(image),
                tags: summary.tags,
                published: parseDate(summary.date),
                updated: parseDate(summary.updated ?? summary.date),
                contentHtml: article?.html ?? '',
            };
        })
    );

    // The feed's own timestamp is the most recent article change, or now when
    // the corpus is empty so the feed is still valid.
    const updated = items.reduce<Date>(
        (latest, item) => (item.updated > latest ? item.updated : latest),
        new Date(0)
    );

    return {
        title: siteName,
        description: siteDescription,
        updated: items.length > 0 ? updated : new Date(),
        items,
    };
}

/** Escape text for safe inclusion in an XML text node or attribute. */
function xmlEscape(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/** Wrap a full HTML body in CDATA, splitting any literal `]]>` so it stays valid. */
function cdata(html: string): string {
    return `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

/** RFC-822 date for RSS `pubDate`/`lastBuildDate` (e.g. via toUTCString). */
function toRfc822(date: Date): string {
    return date.toUTCString();
}

/** RFC-3339 date for Atom and JSON Feed timestamps. */
function toRfc3339(date: Date): string {
    return date.toISOString();
}

/** Serialise the feed model to RSS 2.0. */
export function renderRssFeed(data: FeedData): string {
    const items = data.items
        .map((item) =>
            [
                '    <item>',
                `      <title>${xmlEscape(item.title)}</title>`,
                `      <link>${xmlEscape(item.url)}</link>`,
                `      <guid isPermaLink="true">${xmlEscape(item.url)}</guid>`,
                `      <pubDate>${toRfc822(item.published)}</pubDate>`,
                `      <description>${xmlEscape(item.description)}</description>`,
                ...item.tags.map(
                    (tag) => `      <category>${xmlEscape(tag)}</category>`
                ),
                `      <content:encoded>${cdata(item.contentHtml)}</content:encoded>`,
                '    </item>',
            ].join('\n')
        )
        .join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
        '  <channel>',
        `    <title>${xmlEscape(data.title)}</title>`,
        `    <link>${siteURL}</link>`,
        `    <description>${xmlEscape(data.description)}</description>`,
        '    <language>en</language>',
        `    <managingEditor>${xmlEscape(siteAuthorEmail)} (${xmlEscape(siteAuthor)})</managingEditor>`,
        `    <lastBuildDate>${toRfc822(data.updated)}</lastBuildDate>`,
        `    <atom:link href="${siteURL}/feed.xml" rel="self" type="application/rss+xml"/>`,
        items,
        '  </channel>',
        '</rss>',
        '',
    ].join('\n');
}

/** Serialise the feed model to Atom 1.0. */
export function renderAtomFeed(data: FeedData): string {
    const entries = data.items
        .map((item) =>
            [
                '  <entry>',
                `    <id>${xmlEscape(item.url)}</id>`,
                `    <title>${xmlEscape(item.title)}</title>`,
                `    <link href="${xmlEscape(item.url)}"/>`,
                `    <published>${toRfc3339(item.published)}</published>`,
                `    <updated>${toRfc3339(item.updated)}</updated>`,
                `    <summary>${xmlEscape(item.description)}</summary>`,
                ...item.tags.map(
                    (tag) => `    <category term="${xmlEscape(tag)}"/>`
                ),
                `    <content type="html">${cdata(item.contentHtml)}</content>`,
                '  </entry>',
            ].join('\n')
        )
        .join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        `  <id>${siteURL}/</id>`,
        `  <title>${xmlEscape(data.title)}</title>`,
        `  <subtitle>${xmlEscape(data.description)}</subtitle>`,
        `  <updated>${toRfc3339(data.updated)}</updated>`,
        `  <link href="${siteURL}"/>`,
        `  <link href="${siteURL}/atom.xml" rel="self" type="application/atom+xml"/>`,
        '  <author>',
        `    <name>${xmlEscape(siteAuthor)}</name>`,
        `    <email>${xmlEscape(siteAuthorEmail)}</email>`,
        '  </author>',
        entries,
        '</feed>',
        '',
    ].join('\n');
}

/** Serialise the feed model to JSON Feed 1.1. */
export function renderJsonFeed(data: FeedData): string {
    const feed = {
        version: 'https://jsonfeed.org/version/1.1',
        title: data.title,
        description: data.description,
        home_page_url: siteURL,
        feed_url: `${siteURL}/feed.json`,
        language: 'en',
        authors: [{ name: siteAuthor, url: siteURL }],
        items: data.items.map((item) => ({
            id: item.url,
            url: item.url,
            title: item.title,
            summary: item.description,
            content_html: item.contentHtml,
            image: item.imageUrl,
            date_published: toRfc3339(item.published),
            date_modified: toRfc3339(item.updated),
            tags: item.tags,
        })),
    };
    return `${JSON.stringify(feed, null, 2)}\n`;
}
