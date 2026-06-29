import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
    marked,
    type Tokens,
    type TokenizerAndRendererExtension,
} from 'marked';
import { codeToHtml } from 'shiki';
import {
    coverGradientForSlug,
    generatedCoverPath,
} from '@/utils/generateArticleCover';

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');
const PUBLIC_DIRECTORY = path.join(process.cwd(), 'public');

/** How many articles are listed per page on the /articles index. */
export const ARTICLES_PER_PAGE = 9;

/** A self-rated difficulty, surfaced as a badge on the article header. */
export type ArticleDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** One article's place in a multi-part series, declared in its frontmatter. */
interface SeriesFrontmatter {
    name: string;
    order: number;
}

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

/** A heading in the article body, used to build the table of contents. */
export interface TocItem {
    id: string;
    text: string;
    /** Heading level: 2 for `##`, 3 for `###`. */
    level: number;
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

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// A standalone GitHub gist URL on its own line becomes an embedded gist,
// fetched and inlined at build time by renderGist below.
const GIST_PATTERN =
    /^(https:\/\/gist\.github\.com\/[\w.-]+\/[0-9a-f]+)(?:\.js)?[ \t]*(?:\n+|$)/;

type GistToken = Tokens.Generic & { url?: string; html?: string };

// GitHub serves an embeddable HTML fragment plus a stylesheet for each gist via
// its .json endpoint. We fetch and inline both at build time, so the gist is
// fully styled in the static HTML with no iframe and no client JS. If the fetch
// fails (offline build, deleted gist) we fall back to a link, never the build.
async function renderGist(url: string): Promise<string> {
    try {
        const response = await fetch(`${url}.json`);
        if (!response.ok) throw new Error(`gist responded ${response.status}`);
        const data = (await response.json()) as {
            div?: string;
            stylesheet?: string;
        };
        if (!data.div) throw new Error('gist response missing markup');
        let stylesheet = data.stylesheet ?? '';
        if (stylesheet.startsWith('//')) stylesheet = `https:${stylesheet}`;
        const link = stylesheet
            ? `<link rel="stylesheet" href="${stylesheet}" />`
            : '';
        return (
            `<div class="not-prose gist-embed" data-color-mode="light" ` +
            `data-light-theme="light">${link}${data.div}</div>`
        );
    } catch {
        return (
            `<p class="gist-embed gist-embed--fallback">` +
            `<a href="${url}" target="_blank" rel="noopener noreferrer">` +
            `View this gist on GitHub</a></p>`
        );
    }
}

const gistExtension: TokenizerAndRendererExtension = {
    name: 'gist',
    level: 'block',
    start(src) {
        const index = src.indexOf('https://gist.github.com/');
        return index < 0 ? undefined : index;
    },
    tokenizer(src) {
        const match = GIST_PATTERN.exec(src);
        if (!match) return undefined;
        return { type: 'gist', raw: match[0], url: match[1] };
    },
    renderer(token) {
        const gistToken = token as GistToken;
        return typeof gistToken.html === 'string' ? gistToken.html : '';
    },
};

// Build-time syntax highlighting with two themes; globals.css picks the dark
// palette under prefers-color-scheme so code matches the site theme.
type CodeToken = Tokens.Code & { highlighted?: string };
const CODE_THEMES = { light: 'github-light', dark: 'github-dark' } as const;

interface CodeMeta {
    lang: string;
    filePath?: string;
}

/**
 * Parses a fenced block's info string into a language plus an optional file path
 * (where the snippet belongs). Supports `lang path/to/file.ext` and
 * `lang title="path/to/file.ext"`.
 */
function parseCodeMeta(token: CodeToken): CodeMeta {
    const info = (token.lang ?? '').trim();
    if (!info) return { lang: 'text' };
    const [lang, ...rest] = info.split(/\s+/);
    const titled = info.match(/title="([^"]+)"/);
    const remainder = rest.join(' ').trim();
    const filePath = titled
        ? titled[1]
        : remainder && !remainder.includes('=')
          ? remainder
          : undefined;
    return { lang: lang || 'text', filePath };
}

/** Header label: the file extension when a path is given, else the language. */
function codeLabel(lang: string, filePath?: string): string {
    if (!filePath) return lang;
    const name = filePath.split('/').pop() ?? filePath;
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(dot + 1) : lang;
}

/**
 * Wraps highlighted code in a header (language/extension badge + optional file
 * path) with a copy-button slot the client fills in (see CodeBlock).
 */
function renderCodeBlock(
    highlighted: string,
    lang: string,
    filePath?: string
): string {
    const pathHtml = filePath
        ? `<span class="code-block__path">${escapeHtml(filePath)}</span>`
        : '';
    return (
        `<figure class="code-block not-prose">` +
        `<figcaption class="code-block__bar">` +
        `<span class="code-block__meta">` +
        `<span class="code-block__lang">${escapeHtml(codeLabel(lang, filePath))}</span>` +
        pathHtml +
        `</span>` +
        `<span class="code-block__copy" data-code-copy></span>` +
        `</figcaption>` +
        highlighted +
        `</figure>`
    );
}

async function highlightCode(code: string, lang: string): Promise<string> {
    try {
        return await codeToHtml(code, {
            lang,
            themes: CODE_THEMES,
            defaultColor: false,
        });
    } catch {
        return await codeToHtml(code, {
            lang: 'text',
            themes: CODE_THEMES,
            defaultColor: false,
        });
    }
}

marked.use({
    async: true,
    extensions: [gistExtension],
    async walkTokens(token) {
        if (token.type === 'code') {
            const codeToken = token as CodeToken;
            const { lang } = parseCodeMeta(codeToken);
            // Mermaid blocks render to SVG in the browser (see MermaidRenderer),
            // so skip Shiki and let the code renderer emit a <pre class="mermaid">.
            if (lang === 'mermaid') return;
            codeToken.highlighted = await highlightCode(codeToken.text, lang);
        }
        if (token.type === 'gist') {
            const gistToken = token as GistToken;
            if (typeof gistToken.url === 'string') {
                gistToken.html = await renderGist(gistToken.url);
            }
        }
    },
    renderer: {
        code(token) {
            const codeToken = token as CodeToken;
            const { lang, filePath } = parseCodeMeta(codeToken);
            if (lang === 'mermaid') {
                return `<pre class="mermaid not-prose">${escapeHtml(
                    codeToken.text
                )}</pre>`;
            }
            const highlighted =
                codeToken.highlighted ??
                `<pre><code>${escapeHtml(codeToken.text)}</code></pre>`;
            return renderCodeBlock(highlighted, lang, filePath);
        },
    },
});

/** Turn heading text into a URL-safe anchor slug (`Cache-aside` -> `cache-aside`). */
function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const HTML_ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
};

/** Strip inline tags and decode the few entities `marked` emits, for plain text. */
function headingPlainText(inner: string): string {
    return inner
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => HTML_ENTITIES[entity])
        // Drop any other entity (e.g. &hellip;, &#8230;) so it never leaks a
        // literal "hellip" into the slug; the visible heading keeps its glyph.
        .replace(/&#?[a-z0-9]+;/gi, '')
        .trim();
}

/**
 * Adds stable `id` anchors to the body's H2/H3 headings and returns the table of
 * contents alongside the rewritten HTML. IDs and the TOC are produced in a single
 * pass so they always agree; duplicate slugs are disambiguated with a numeric
 * suffix (`-2`, `-3`). Headings that already carry an id are left untouched.
 */
function addHeadingIdsAndExtractToc(html: string): {
    html: string;
    toc: TocItem[];
} {
    const toc: TocItem[] = [];
    const used = new Map<string, number>();
    const rewritten = html.replace(
        /<h([23])>([\s\S]*?)<\/h\1>/g,
        (match, level: string, inner: string) => {
            const text = headingPlainText(inner);
            if (!text) return match;
            const base = slugifyHeading(text) || 'section';
            const seen = used.get(base) ?? 0;
            used.set(base, seen + 1);
            const id = seen === 0 ? base : `${base}-${seen + 1}`;
            toc.push({ id, text, level: Number(level) });
            return `<h${level} id="${id}">${inner}</h${level}>`;
        }
    );
    return { html: rewritten, toc };
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
    const rendered = await marked.parse(article.content);
    const { html, toc } = addHeadingIdsAndExtractToc(rendered);
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
