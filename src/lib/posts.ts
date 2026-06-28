import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
    marked,
    type Tokens,
    type TokenizerAndRendererExtension,
} from 'marked';
import { codeToHtml } from 'shiki';
import { generatedCoverPath } from '@/utils/generateArticleCover';

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

/** How many articles are listed per page on the /articles index. */
export const ARTICLES_PER_PAGE = 6;

interface Frontmatter {
    title?: string;
    description?: string;
    date?: string;
    updated?: string;
    tags?: string[];
    draft?: boolean;
    cover?: string;
}

export interface ArticleSummary {
    slug: string;
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
    cover: string;
    readingMinutes: number;
}

export interface Article extends ArticleSummary {
    html: string;
}

interface ParsedArticle {
    slug: string;
    data: Frontmatter;
    content: string;
}

function readArticleFiles(): ParsedArticle[] {
    if (!fs.existsSync(ARTICLES_DIRECTORY)) return [];
    return fs
        .readdirSync(ARTICLES_DIRECTORY)
        .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
        .map((name) => {
            const slug = name.replace(/\.mdx?$/, '');
            const raw = fs.readFileSync(
                path.join(ARTICLES_DIRECTORY, name),
                'utf8'
            );
            const { data, content } = matter(raw);
            return { slug, data: data as Frontmatter, content };
        });
}

function estimateReadingMinutes(content: string): number {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function toSummary(article: ParsedArticle): ArticleSummary {
    const { slug, data, content } = article;
    return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? '',
        date: data.date ?? '',
        updated: data.updated,
        tags: Array.isArray(data.tags) ? data.tags : [],
        cover: data.cover ?? generatedCoverPath(slug),
        readingMinutes: estimateReadingMinutes(content),
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

/** A single rendered article, or null if the slug is missing or a draft. */
export async function getArticle(slug: string): Promise<Article | null> {
    const article = readArticleFiles().find((item) => item.slug === slug);
    if (!article || article.data.draft === true) return null;
    const html = await marked.parse(article.content);
    return { ...toSummary(article), html };
}

/** Up to `limit` other articles, ranked by shared tags then recency. */
export function getRelatedArticles(slug: string, limit = 3): ArticleSummary[] {
    const all = getAllArticles();
    const current = all.find((article) => article.slug === slug);
    if (!current) return [];
    const currentTags = new Set(current.tags);
    return all
        .filter((article) => article.slug !== slug)
        .map((article) => ({
            article,
            shared: article.tags.filter((tag) => currentTags.has(tag)).length,
        }))
        .sort((a, b) => b.shared - a.shared)
        .slice(0, limit)
        .map((entry) => entry.article);
}

/** Every tag used across published articles, most frequent first. */
export function getAllTags(): string[] {
    const counts = new Map<string, number>();
    for (const article of getAllArticles()) {
        for (const tag of article.tags) {
            counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
    }
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([tag]) => tag);
}
