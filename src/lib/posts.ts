import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

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
    cover?: string;
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
        cover: data.cover,
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

/** A single rendered article, or null if the slug is missing or a draft. */
export function getArticle(slug: string): Article | null {
    const article = readArticleFiles().find((item) => item.slug === slug);
    if (!article || article.data.draft === true) return null;
    const html = marked.parse(article.content, { async: false }) as string;
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
