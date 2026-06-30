import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
    coverGradientForSlug,
    generatedCoverPath,
} from '@/utils/generateArticleCover';
import { normalizeFrontmatter, stringifyArticle } from '@/lib/admin/frontmatter';
import type {
    ArticleDetail,
    ArticleFrontmatter,
    ArticleListItem,
    ArticleLocation,
    ArticleStatus,
    SaveArticlePayload,
    StudioMeta,
} from '@/lib/admin/types';

/**
 * The Article Studio's filesystem layer. Every Studio API route delegates here.
 * It is the only place that touches `content/`, and it never runs in production
 * (the routes that import it are dev-only, see next.config.ts). Markdown files
 * stay the single source of truth: there is no database and no cache.
 */

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const PUBLIC_DIRECTORY = path.join(process.cwd(), 'public');

const LOCATION_DIRECTORIES: Record<ArticleLocation, string> = {
    published: path.join(CONTENT_ROOT, 'articles'),
    drafts: path.join(CONTENT_ROOT, 'article_drafts'),
};
const TRASH_DIRECTORY = path.join(CONTENT_ROOT, 'article_trash');
const INLINE_IMAGE_DIRECTORY = path.join(
    PUBLIC_DIRECTORY,
    'images/articles/inline'
);

/** A validated, parsed article handle. */
interface ParsedId {
    location: ArticleLocation;
    fileName: string;
    directory: string;
    fullPath: string;
}

export class StudioError extends Error {
    constructor(
        message: string,
        readonly status = 400
    ) {
        super(message);
        this.name = 'StudioError';
    }
}

const FILENAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.mdx?$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Parse and validate a `"<location>/<filename>"` handle, blocking traversal. */
export function parseId(id: string): ParsedId {
    const separator = id.indexOf('/');
    if (separator < 0) throw new StudioError(`Malformed article id: ${id}`);
    const location = id.slice(0, separator) as ArticleLocation;
    const fileName = id.slice(separator + 1);
    if (location !== 'published' && location !== 'drafts')
        throw new StudioError(`Unknown article location: ${location}`);
    if (!FILENAME_PATTERN.test(fileName) || fileName.includes('..'))
        throw new StudioError(`Unsafe article filename: ${fileName}`);
    const directory = LOCATION_DIRECTORIES[location];
    return { location, fileName, directory, fullPath: path.join(directory, fileName) };
}

function buildId(location: ArticleLocation, fileName: string): string {
    return `${location}/${fileName}`;
}

function ensureDirectories(): void {
    for (const directory of Object.values(LOCATION_DIRECTORIES)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

/**
 * Write a file atomically: a temp file followed by a rename, so a concurrent
 * reader (or an interrupted write) never sees a half-written Markdown file. The
 * Markdown is the production source of truth, so a torn write must be impossible.
 */
function writeFileAtomic(targetPath: string, data: string | Buffer): void {
    const tempPath = `${targetPath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, data);
    fs.renameSync(tempPath, targetPath);
}

/** Strip the ordering prefix and extension to recover the production slug. */
function slugFromFileName(fileName: string): string {
    return fileName.replace(/\.mdx?$/, '').replace(/^\d+-/, '');
}

export function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function estimateReadingMinutes(content: string): number {
    return Math.max(1, Math.round(wordCount(content) / 200));
}

function wordCount(content: string): number {
    return content.trim().split(/\s+/).filter(Boolean).length;
}

/** The two cover accent colours, read from a custom SVG or derived from slug. */
function resolveCoverColors(
    cover: string | undefined,
    slug: string
): readonly [string, string] {
    if (cover && cover !== generatedCoverPath(slug)) {
        try {
            const svg = fs.readFileSync(
                path.join(PUBLIC_DIRECTORY, cover),
                'utf8'
            );
            const stops = [
                ...svg.matchAll(/stop-color="(#[0-9a-fA-F]{3,8})"/g),
            ].map((match) => match[1]);
            if (stops.length >= 2) return [stops[0], stops[1]];
            if (stops.length === 1) return [stops[0], stops[0]];
        } catch {
            // fall through to the deterministic pair
        }
    }
    return coverGradientForSlug(slug);
}

function statusFor(
    location: ArticleLocation,
    frontmatter: ArticleFrontmatter
): ArticleStatus {
    if (location === 'drafts') return 'draft';
    return frontmatter.draft ? 'hidden' : 'published';
}

function toListItem(location: ArticleLocation, fileName: string): ArticleListItem {
    const fullPath = path.join(LOCATION_DIRECTORIES[location], fileName);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const stats = fs.statSync(fullPath);
    const { data, content } = matter(raw);
    const slug = slugFromFileName(fileName);
    const frontmatter = normalizeFrontmatter(
        data as Record<string, unknown>,
        slug
    );
    const hasCustomCover = Boolean(frontmatter.cover);
    const cover = frontmatter.cover ?? generatedCoverPath(slug);

    return {
        id: buildId(location, fileName),
        location,
        status: statusFor(location, frontmatter),
        fileName,
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        updated: frontmatter.updated,
        tags: frontmatter.tags,
        category: frontmatter.category,
        difficulty: frontmatter.difficulty,
        featured: frontmatter.featured === true,
        series: frontmatter.series,
        cover,
        hasCustomCover,
        coverColors: resolveCoverColors(frontmatter.cover, slug),
        readingMinutes: estimateReadingMinutes(content),
        wordCount: wordCount(content),
        lastModified: stats.mtime.toISOString(),
    };
}

function readDirectory(location: ArticleLocation): ArticleListItem[] {
    const directory = LOCATION_DIRECTORIES[location];
    if (!fs.existsSync(directory)) return [];
    return fs
        .readdirSync(directory)
        .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
        .map((name) => toListItem(location, name));
}

/** Every article across both folders, newest first (drafts sort by mtime). */
export function listArticles(): ArticleListItem[] {
    ensureDirectories();
    const items = [...readDirectory('published'), ...readDirectory('drafts')];
    return items.sort((a, b) => {
        const left = a.date || a.lastModified;
        const right = b.date || b.lastModified;
        return left < right ? 1 : left > right ? -1 : 0;
    });
}

/** One article with its body and raw contents, for the editor. */
export function readArticle(id: string): ArticleDetail {
    const { location, fileName, fullPath } = parseId(id);
    if (!fs.existsSync(fullPath))
        throw new StudioError(`Article not found: ${id}`, 404);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);
    const slug = slugFromFileName(fileName);
    const frontmatter = normalizeFrontmatter(
        data as Record<string, unknown>,
        slug
    );
    return { ...toListItem(location, fileName), frontmatter, content, raw };
}

/** The largest numeric ordering prefix in use across both folders. */
function highestPrefix(): number {
    let highest = 0;
    for (const location of ['published', 'drafts'] as const) {
        const directory = LOCATION_DIRECTORIES[location];
        if (!fs.existsSync(directory)) continue;
        for (const name of fs.readdirSync(directory)) {
            const match = name.match(/^(\d+)-/);
            if (match) highest = Math.max(highest, Number(match[1]));
        }
    }
    return highest;
}

function existingSlugs(): Set<string> {
    const slugs = new Set<string>();
    for (const item of listArticles()) slugs.add(item.slug);
    return slugs;
}

/** A slug not yet used by any article (adds `-2`, `-3`, ... on collision). */
function uniqueSlug(base: string, taken: Set<string>): string {
    const root = slugify(base) || 'untitled';
    if (!taken.has(root)) return root;
    let suffix = 2;
    while (taken.has(`${root}-${suffix}`)) suffix += 1;
    return `${root}-${suffix}`;
}

function nextFileName(slug: string): string {
    const prefix = String(highestPrefix() + 1).padStart(2, '0');
    return `${prefix}-${slug}.md`;
}

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

/** Create a blank draft scaffold and return its handle. */
export function createArticle(seed?: { title?: string }): { id: string } {
    ensureDirectories();
    const title = seed?.title?.trim() || 'Untitled article';
    const slug = uniqueSlug(title === 'Untitled article' ? 'untitled' : title, existingSlugs());
    const fileName = nextFileName(slug);
    const frontmatter: ArticleFrontmatter = {
        title,
        description: '',
        date: todayIso(),
        tags: [],
        tech: [],
        learn: [],
        keywords: [],
        draft: true,
    };
    const body = stringifyArticle(
        frontmatter,
        'Start writing your article here, or press "/" to insert a block.\n'
    );
    writeFileAtomic(path.join(LOCATION_DIRECTORIES.drafts, fileName), body);
    return { id: buildId('drafts', fileName) };
}

/** Persist edits, renaming the file when the slug changes. Returns the handle. */
export function saveArticle(id: string, payload: SaveArticlePayload): { id: string } {
    const parsed = parseId(id);
    if (!fs.existsSync(parsed.fullPath))
        throw new StudioError(`Article not found: ${id}`, 404);

    const currentSlug = slugFromFileName(parsed.fileName);
    const desiredSlug = payload.slug ? slugify(payload.slug) : currentSlug;
    if (!desiredSlug || !SLUG_PATTERN.test(desiredSlug))
        throw new StudioError(`Invalid slug: ${payload.slug ?? ''}`);

    const body = stringifyArticle(payload.frontmatter, payload.content);

    // Rename in place (keeping the ordering prefix) when the slug changed.
    let fileName = parsed.fileName;
    if (desiredSlug !== currentSlug) {
        const taken = existingSlugs();
        taken.delete(currentSlug);
        if (taken.has(desiredSlug))
            throw new StudioError(`Slug already in use: ${desiredSlug}`, 409);
        const prefix = parsed.fileName.match(/^(\d+)-/)?.[1];
        fileName = prefix
            ? `${prefix}-${desiredSlug}.md`
            : nextFileName(desiredSlug);
        let nextPath = path.join(parsed.directory, fileName);
        // Never clobber an unrelated file the slug set did not account for.
        if (nextPath !== parsed.fullPath && fs.existsSync(nextPath)) {
            fileName = nextFileName(desiredSlug);
            nextPath = path.join(parsed.directory, fileName);
        }
        writeFileAtomic(nextPath, body);
        if (nextPath !== parsed.fullPath) fs.rmSync(parsed.fullPath);
    } else {
        writeFileAtomic(parsed.fullPath, body);
    }

    return { id: buildId(parsed.location, fileName) };
}

/** Move an article into the recycle bin. Returns its trash filename. */
export function trashArticle(id: string): { trashed: string } {
    const parsed = parseId(id);
    if (!fs.existsSync(parsed.fullPath))
        throw new StudioError(`Article not found: ${id}`, 404);
    fs.mkdirSync(TRASH_DIRECTORY, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const trashName = `${parsed.location}__${stamp}__${parsed.fileName}`;
    fs.renameSync(parsed.fullPath, path.join(TRASH_DIRECTORY, trashName));
    return { trashed: trashName };
}

/** Copy an article into a new draft, marked as a copy. Returns the new handle. */
export function duplicateArticle(id: string): { id: string } {
    const detail = readArticle(id);
    const taken = existingSlugs();
    const slug = uniqueSlug(`${detail.slug}-copy`, taken);
    const fileName = nextFileName(slug);
    const frontmatter: ArticleFrontmatter = {
        ...detail.frontmatter,
        title: `${detail.frontmatter.title} (copy)`,
        date: todayIso(),
        updated: undefined,
        draft: true,
        // A copy must not inherit identity-bearing fields: the cover (both would
        // share one thumbnail), the canonical URL (it would point at the
        // original, an SEO duplicate), or the featured flag.
        cover: undefined,
        canonical: undefined,
        featured: false,
    };
    const body = stringifyArticle(frontmatter, detail.content);
    writeFileAtomic(path.join(LOCATION_DIRECTORIES.drafts, fileName), body);
    return { id: buildId('drafts', fileName) };
}

/**
 * Publish (move into `articles/`, clear the draft flag) or unpublish (move into
 * `article_drafts/`). Mirrors the issue's "publishing physically moves the
 * Markdown file" workflow. Returns the article's new handle.
 */
export function setPublished(id: string, publish: boolean): { id: string } {
    const parsed = parseId(id);
    if (!fs.existsSync(parsed.fullPath))
        throw new StudioError(`Article not found: ${id}`, 404);
    ensureDirectories();

    const target: ArticleLocation = publish ? 'published' : 'drafts';
    const raw = fs.readFileSync(parsed.fullPath, 'utf8');
    const { data, content } = matter(raw);
    const slug = slugFromFileName(parsed.fileName);
    const frontmatter = normalizeFrontmatter(
        data as Record<string, unknown>,
        slug
    );

    if (publish) {
        frontmatter.draft = undefined;
        // Stamp an updated date when republishing an already-dated article.
        if (frontmatter.date && parsed.location === 'published')
            frontmatter.updated = todayIso();
        if (!frontmatter.date) frontmatter.date = todayIso();
    }

    let fileName = parsed.fileName;
    let targetPath = path.join(LOCATION_DIRECTORIES[target], fileName);
    if (target !== parsed.location && fs.existsSync(targetPath)) {
        fileName = nextFileName(slug);
        targetPath = path.join(LOCATION_DIRECTORIES[target], fileName);
    }

    writeFileAtomic(targetPath, stringifyArticle(frontmatter, content));
    if (targetPath !== parsed.fullPath) fs.rmSync(parsed.fullPath);
    return { id: buildId(target, fileName) };
}

/** Tag / category / series suggestions aggregated across every article. */
export function getMeta(): StudioMeta {
    const tags = new Set<string>();
    const categories = new Set<string>();
    const series = new Set<string>();
    for (const item of listArticles()) {
        item.tags.forEach((tag) => tags.add(tag));
        if (item.category) categories.add(item.category);
        if (item.series) series.add(item.series.name);
    }
    const sorted = (set: Set<string>) =>
        [...set].sort((a, b) => a.localeCompare(b));
    return {
        tags: sorted(tags),
        categories: sorted(categories),
        series: sorted(series),
    };
}

/** Persist an uploaded inline image and return its public path. */
export function saveInlineImage(
    originalName: string,
    data: Buffer
): { path: string } {
    fs.mkdirSync(INLINE_IMAGE_DIRECTORY, { recursive: true });
    const extension = (path.extname(originalName) || '.png').toLowerCase();
    const base = slugify(path.basename(originalName, path.extname(originalName)));
    let fileName = `${base || 'image'}${extension}`;
    let counter = 2;
    while (fs.existsSync(path.join(INLINE_IMAGE_DIRECTORY, fileName))) {
        fileName = `${base || 'image'}-${counter}${extension}`;
        counter += 1;
    }
    writeFileAtomic(path.join(INLINE_IMAGE_DIRECTORY, fileName), data);
    return { path: `/images/articles/inline/${fileName}` };
}
