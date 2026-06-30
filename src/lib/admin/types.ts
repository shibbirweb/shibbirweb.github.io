import type { ArticleDifficulty } from '@/lib/posts';

/**
 * Shared Article Studio types. These are plain data shapes with no Node
 * dependencies, so both the server store (`articleStore.ts`) and the client
 * editor components can import them.
 */

/** Where an article currently lives, derived from its folder plus draft flag. */
export type ArticleStatus = 'published' | 'draft' | 'hidden';

/** The on-disk folder an article handle points at. */
export type ArticleLocation = 'published' | 'drafts';

/**
 * The structured frontmatter the Studio reads and writes. Mirrors the fields the
 * production pipeline understands (see `src/lib/posts.ts`) plus a few forward
 * looking SEO fields it preserves verbatim. `slug` is intentionally absent: the
 * production URL is derived from the filename, so the Studio treats the filename
 * as the slug and renames the file when it changes.
 */
export interface ArticleFrontmatter {
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
    category?: string;
    difficulty?: ArticleDifficulty;
    /** Surfaced for future "featured" placement; persisted but not yet rendered. */
    featured?: boolean;
    /** Hides a file that lives in the published folder from the live site. */
    draft?: boolean;
    tech: string[];
    learn: string[];
    series?: { name: string; order: number };
    cover?: string;
    /** Canonical URL override, persisted for future SEO wiring. */
    canonical?: string;
    /** Per-article SEO keywords, persisted for future SEO wiring. */
    keywords: string[];
}

/** One row in the dashboard: enough metadata to list, search, and sort. */
export interface ArticleListItem {
    /** Stable handle, `"<location>/<filename>"`, used by every API call. */
    id: string;
    location: ArticleLocation;
    status: ArticleStatus;
    fileName: string;
    /** Filename-derived slug, identical to the production article URL. */
    slug: string;
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
    category?: string;
    difficulty?: ArticleDifficulty;
    featured: boolean;
    series?: { name: string; order: number };
    /** A custom cover path when set, else the generated cover path. */
    cover: string;
    /** True when `cover` is a real author-provided file on disk. */
    hasCustomCover: boolean;
    /** Two accent colours so the dashboard can tint a thumbnail with no image. */
    coverColors: readonly [string, string];
    readingMinutes: number;
    wordCount: number;
    /** File mtime as an ISO string, for the "last modified" column. */
    lastModified: string;
}

/** A single article opened in the editor: list metadata plus its body + raw. */
export interface ArticleDetail extends ArticleListItem {
    frontmatter: ArticleFrontmatter;
    /** Body Markdown with the frontmatter block stripped. */
    content: string;
    /** The full file contents, frontmatter included. */
    raw: string;
}

/** Aggregated suggestions that power the tag / category / series pickers. */
export interface StudioMeta {
    tags: string[];
    categories: string[];
    series: string[];
}

/** The payload the editor sends on save. */
export interface SaveArticlePayload {
    frontmatter: ArticleFrontmatter;
    content: string;
    /** Desired slug; when it differs from the current one the file is renamed. */
    slug?: string;
}
