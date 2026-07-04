'use server';

import fs from 'node:fs';
import path from 'node:path';
import { slugifyHeading } from '@/lib/markdown';
import {
    nextNumberPrefix,
    parseArticleFile,
    serializeArticle,
} from '@/utils/articleFile';
import type {
    ArticleDraft,
    ArticleListItem,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';

// Dev-only filesystem access for the article editor. This module runs only under
// `next dev` (where `output` is not `export`): the editor route and its Preview
// are `.dev` files excluded from the production build, and nothing in the export
// build imports this, so no Server Action ever ships. Every path is confined to
// the two content folders below with a sanitized, slugified file name.

const CONTENT_DIRECTORY = path.join(process.cwd(), 'content');
const PUBLISHED_DIRECTORY = path.join(CONTENT_DIRECTORY, 'articles');
const DRAFT_DIRECTORY = path.join(CONTENT_DIRECTORY, 'article_drafts');

type ArticleStatus = 'published' | 'draft';

/** Markdown files in a content folder, or `[]` when the folder does not exist. */
function readFolder(directory: string): string[] {
    if (!fs.existsSync(directory)) return [];
    return fs
        .readdirSync(directory)
        .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'));
}

/** The URL slug a file maps to: extension and `NN-` ordering prefix stripped. */
function fileSlug(fileName: string): string {
    return fileName.replace(/\.mdx?$/, '').replace(/^\d+-/, '');
}

/** The file in `directory` whose slug matches, if any (used to save in place / move). */
function findFileBySlug(directory: string, slug: string): string | undefined {
    return readFolder(directory).find((name) => fileSlug(name) === slug);
}

/** Every article across both folders, tagged with its publish status. */
export async function listArticles(): Promise<ArticleListItem[]> {
    const folders: ReadonlyArray<[string, ArticleStatus]> = [
        [PUBLISHED_DIRECTORY, 'published'],
        [DRAFT_DIRECTORY, 'draft'],
    ];
    const items: ArticleListItem[] = [];
    for (const [directory, status] of folders) {
        for (const file of readFolder(directory)) {
            const raw = fs.readFileSync(path.join(directory, file), 'utf8');
            const { frontmatter } = parseArticleFile(raw);
            const slug = fileSlug(file);
            items.push({
                file,
                slug,
                title: frontmatter.title || slug,
                status,
            });
        }
    }
    // Published first, then drafts; newest ordering prefix first within each group.
    return items.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'published' ? -1 : 1;
        return a.file < b.file ? 1 : -1;
    });
}

/** Read one file (by name, in either folder) back into editable form. */
export async function loadArticle(file: string): Promise<ArticleDraft> {
    const name = path.basename(file); // no directory traversal
    const inDraft = readFolder(DRAFT_DIRECTORY).includes(name);
    const directory = inDraft ? DRAFT_DIRECTORY : PUBLISHED_DIRECTORY;
    if (!readFolder(directory).includes(name)) {
        throw new Error(`Article not found: ${file}`);
    }
    const raw = fs.readFileSync(path.join(directory, name), 'utf8');
    const { frontmatter, body } = parseArticleFile(raw);
    // The folder is the source of truth for draft status, so the toggle in the
    // form always agrees with where the file actually lives.
    return {
        frontmatter: { ...frontmatter, draft: inDraft ? true : undefined },
        body,
    };
}

/**
 * Write a draft to disk in the house style. `draft` picks the folder
 * (`article_drafts` vs `articles`); an existing same-slug file in the target is
 * overwritten in place (its ordering prefix reused), otherwise the next prefix is
 * assigned. Toggling `draft` moves the file: any same-slug copy in the sibling
 * folder is removed. `slug` is the author's file-name override (from the save bar);
 * it falls back to the title, and is re-slugified server-side so the written path
 * is always confined and safe.
 */
export async function saveArticle(
    input: ArticleDraft,
    slugOverride: string
): Promise<{ file: string; status: ArticleStatus }> {
    const status: ArticleStatus = input.frontmatter.draft
        ? 'draft'
        : 'published';
    const targetDirectory =
        status === 'draft' ? DRAFT_DIRECTORY : PUBLISHED_DIRECTORY;
    const siblingDirectory =
        status === 'draft' ? PUBLISHED_DIRECTORY : DRAFT_DIRECTORY;

    const slug =
        slugifyHeading(slugOverride) ||
        slugifyHeading(input.frontmatter.title) ||
        'untitled-article';
    // `slugifyHeading` only emits `[a-z0-9-]`; this guard makes the confinement
    // explicit and fails loudly if that ever changes.
    if (slug.includes('/') || slug.includes('..')) {
        throw new Error(`Unsafe slug: ${slug}`);
    }

    if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory, { recursive: true });
    }

    const existing = findFileBySlug(targetDirectory, slug);
    const prefix =
        existing?.match(/^\d+/)?.[0] ??
        nextNumberPrefix(readFolder(targetDirectory));
    const fileName = `${prefix}-${slug}.md`;

    fs.writeFileSync(
        path.join(targetDirectory, fileName),
        serializeArticle(input.frontmatter, input.body),
        'utf8'
    );

    const moved = findFileBySlug(siblingDirectory, slug);
    if (moved) fs.rmSync(path.join(siblingDirectory, moved));

    return { file: fileName, status };
}

/** A sorted set of one string field across both folders. */
function sortedUnique(values: Iterable<string>): string[] {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/**
 * Distinct existing values across both folders, offered as `<datalist>`
 * autocomplete so authoring reuses them instead of spawning near-duplicates. A
 * superset of `getAllTags` in `posts.ts` (this also sees drafts).
 */
export async function getSuggestions(): Promise<EditorSuggestions> {
    const tags: string[] = [];
    const categories: string[] = [];
    const seriesNames: string[] = [];
    const tech: string[] = [];
    for (const directory of [PUBLISHED_DIRECTORY, DRAFT_DIRECTORY]) {
        for (const file of readFolder(directory)) {
            const raw = fs.readFileSync(path.join(directory, file), 'utf8');
            const { frontmatter } = parseArticleFile(raw);
            tags.push(...frontmatter.tags);
            tech.push(...frontmatter.tech);
            if (frontmatter.category) categories.push(frontmatter.category);
            if (frontmatter.series?.name) seriesNames.push(frontmatter.series.name);
        }
    }
    return {
        tags: sortedUnique(tags),
        categories: sortedUnique(categories),
        seriesNames: sortedUnique(seriesNames),
        tech: sortedUnique(tech),
    };
}
