import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown, type TocItem } from '@/lib/markdown';
import type {
    ArticleDifficulty,
    ArticleSeries as SeriesFrontmatter,
} from '@/lib/articleSchema';
import {
    coverGradientForSlug,
    generatedCoverPath,
} from '@/utils/generateArticleCover';

// Re-exported so existing `@/lib/posts` importers keep working after the
// table-of-contents type moved to `@/lib/markdown` and the frontmatter types to
// `@/lib/articleSchema`.
export type { TocItem } from '@/lib/markdown';
export type { ArticleDifficulty } from '@/lib/articleSchema';

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');
const PUBLIC_DIRECTORY = path.join(process.cwd(), 'public');

/** How many articles are listed per page on the /articles index. */
export const ARTICLES_PER_PAGE = 9;

interface Frontmatter {
    title?: string;
    description?: string;
    date?: string;
    updated?: string;
    tags?: string[];
    draft?: boolean;
    cover?: string;
    /** A single grouping label (broader than tags) used to rank related posts. */
    category?: string;
    difficulty?: ArticleDifficulty;
    /** Concrete tools/stack the article builds on, shown as a stack strip. */
    tech?: string[];
    /** Key takeaways rendered in the "What you'll learn" card. */
    learn?: string[];
    series?: SeriesFrontmatter;
}

/** One entry in a series tracker, in reading order. */
export interface SeriesPart {
    slug: string;
    title: string;
    order: number;
    isCurrent: boolean;
}

/** A resolved series: its name plus every published part, in reading order. */
export interface ArticleSeries {
    name: string;
    parts: SeriesPart[];
}

export interface ArticleSummary {
    slug: string;
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
    cover: string;
    /** The cover's two dominant colours, used to tint the card to match it. */
    coverColors: readonly [string, string];
    readingMinutes: number;
    category?: string;
    difficulty?: ArticleDifficulty;
    series?: SeriesFrontmatter;
}

export interface Article extends ArticleSummary {
    html: string;
    /** Body headings (H2/H3) for the table of contents. */
    toc: TocItem[];
    /** Key takeaways for the "What you'll learn" card; empty when unset. */
    learn: string[];
    /** Stack/tools the article uses; empty when unset. */
    tech: string[];
}

interface ParsedArticle {
    slug: string;
    data: Frontmatter;
    content: string;
}

// A static build renders every article page, and each page reads the full
// corpus several times (getArticle + related + series + adjacent). Parsing all
// files once and caching the result avoids re-reading every markdown file on
// each call. Only cached in production builds so that editing an article in dev
// still shows up on the next request without restarting the server.
let parsedFilesCache: ParsedArticle[] | null = null;

function readArticleFiles(): ParsedArticle[] {
    if (parsedFilesCache && process.env.NODE_ENV === 'production') {
        return parsedFilesCache;
    }
    if (!fs.existsSync(ARTICLES_DIRECTORY)) return [];
    const files = fs
        .readdirSync(ARTICLES_DIRECTORY)
        .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
        .map((name) => {
            // Filenames carry a zero-padded ordering prefix (e.g. `01-`) so the
            // newest article is obvious on disk; it is stripped from the slug so
            // URLs stay clean (`/articles/redis-caching-strategies`).
            const slug = name.replace(/\.mdx?$/, '').replace(/^\d+-/, '');
            const raw = fs.readFileSync(
                path.join(ARTICLES_DIRECTORY, name),
                'utf8'
            );
            const { data, content } = matter(raw);
            return { slug, data: data as Frontmatter, content };
        });
    parsedFilesCache = files;
    return files;
}

function estimateReadingMinutes(content: string): number {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

/**
 * The two dominant colours of an article's cover, so the card can tint itself to
 * match its thumbnail. Generated covers reuse the same gradient pair the SVG is
 * built from; author-provided covers are read from disk and their first two
 * gradient stops parsed. Falls back to the deterministic pair if the file is
 * missing or has no stops (e.g. during the cover pre-generation pass).
 */
function resolveCoverColors(
    cover: string,
    slug: string
): readonly [string, string] {
    if (cover === generatedCoverPath(slug)) return coverGradientForSlug(slug);
    try {
        const svg = fs.readFileSync(path.join(PUBLIC_DIRECTORY, cover), 'utf8');
        const stops = [
            ...svg.matchAll(/stop-color="(#[0-9a-fA-F]{3,8})"/g),
        ].map((match) => match[1]);
        if (stops.length >= 2) return [stops[0], stops[1]];
        if (stops.length === 1) return [stops[0], stops[0]];
    } catch {
        // fall through to the deterministic pair below
    }
    return coverGradientForSlug(slug);
}

function toSummary(article: ParsedArticle): ArticleSummary {
    const { slug, data, content } = article;
    const cover = data.cover ?? generatedCoverPath(slug);
    return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? '',
        date: data.date ?? '',
        updated: data.updated,
        tags: Array.isArray(data.tags) ? data.tags : [],
        cover,
        coverColors: resolveCoverColors(cover, slug),
        readingMinutes: estimateReadingMinutes(content),
        category: data.category,
        difficulty: data.difficulty,
        series:
            data.series && typeof data.series.name === 'string'
                ? { name: data.series.name, order: Number(data.series.order) || 0 }
                : undefined,
    };
}

/** Published articles, newest first. Drafts are excluded. */
export function getAllArticles(): ArticleSummary[] {
    return readArticleFiles()
        .filter((article) => article.data.draft !== true)
        .map(toSummary)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function hasArticles(): boolean {
    return getAllArticles().length > 0;
}

export function getLatestArticles(count: number): ArticleSummary[] {
    return getAllArticles().slice(0, count);
}

export function getArticlePageCount(): number {
    return Math.max(1, Math.ceil(getAllArticles().length / ARTICLES_PER_PAGE));
}

export function getArticlesForPage(page: number): ArticleSummary[] {
    const start = (page - 1) * ARTICLES_PER_PAGE;
    return getAllArticles().slice(start, start + ARTICLES_PER_PAGE);
}

/** A self-contained list of takeaways/tools from frontmatter, never null. */
function stringList(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];
}

/** A single rendered article, or null if the slug is missing or a draft. */
export async function getArticle(slug: string): Promise<Article | null> {
    const article = readArticleFiles().find((item) => item.slug === slug);
    if (!article || article.data.draft === true) return null;
    const { html, toc } = await renderMarkdown(article.content);
    return {
        ...toSummary(article),
        html,
        toc,
        learn: stringList(article.data.learn),
        tech: stringList(article.data.tech),
    };
}

/**
 * Up to `limit` other articles ranked by relevance to `slug`: each shared tag
 * counts most, a shared category and a shared series add a strong signal, and
 * recency breaks ties so the suggestion list never feels stale. Articles with no
 * signal at all are dropped rather than padded with arbitrary posts.
 */
export function getRelatedArticles(slug: string, limit = 3): ArticleSummary[] {
    const all = getAllArticles();
    const current = all.find((article) => article.slug === slug);
    if (!current) return [];
    const currentTags = new Set(current.tags);

    return all
        .filter((article) => article.slug !== slug)
        .map((article) => {
            const sharedTags = article.tags.filter((tag) =>
                currentTags.has(tag)
            ).length;
            const sameCategory =
                current.category && article.category === current.category;
            const sameSeries =
                current.series && article.series?.name === current.series.name;
            const score =
                sharedTags * 3 +
                (sameCategory ? 4 : 0) +
                (sameSeries ? 5 : 0);
            return { article, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) =>
            b.score !== a.score
                ? b.score - a.score
                : a.article.date < b.article.date
                  ? 1
                  : -1
        )
        .slice(0, limit)
        .map((entry) => entry.article);
}

/**
 * The series `slug` belongs to, with every published part in reading order, or
 * null when the article is standalone or the series has only this one part.
 */
export function getSeriesForArticle(slug: string): ArticleSeries | null {
    const all = getAllArticles();
    const current = all.find((article) => article.slug === slug);
    if (!current?.series) return null;
    const seriesName = current.series.name;
    const parts = all
        .filter((article) => article.series?.name === seriesName)
        .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
        .map((article) => ({
            slug: article.slug,
            title: article.title,
            order: article.series?.order ?? 0,
            isCurrent: article.slug === slug,
        }));
    if (parts.length < 2) return null;
    return { name: seriesName, parts };
}

/**
 * The articles published just before and after `slug` in the chronological feed,
 * for previous/next navigation. `previous` is the older neighbour, `next` the
 * newer one; either is undefined at the ends of the list.
 */
export function getAdjacentArticles(slug: string): {
    previous?: ArticleSummary;
    next?: ArticleSummary;
} {
    const all = getAllArticles(); // newest first
    const index = all.findIndex((article) => article.slug === slug);
    if (index === -1) return {};
    return {
        next: index > 0 ? all[index - 1] : undefined,
        previous: index < all.length - 1 ? all[index + 1] : undefined,
    };
}

/** Every tag used across published articles, sorted alphabetically. */
export function getAllTags(): string[] {
    const tags = new Set<string>();
    for (const article of getAllArticles()) {
        for (const tag of article.tags) {
            tags.add(tag);
        }
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
}
