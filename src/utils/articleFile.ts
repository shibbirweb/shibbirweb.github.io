import matter from 'gray-matter';
import type { ArticleFrontmatter } from '@/lib/articleSchema';

// Server-side helpers that read and write article `.md` files in the house style.
// Used by the dev-only editor's Server Actions; `parseArticleFile` reuses the
// existing `gray-matter` dependency, so nothing new is added.

/**
 * The next zero-padded ordering prefix for a folder: one more than the largest
 * leading number across `existingNames`, padded to two digits. An empty folder
 * yields `'01'`.
 */
export function nextNumberPrefix(existingNames: string[]): string {
    let max = 0;
    for (const name of existingNames) {
        const match = name.match(/^(\d+)/);
        if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    return String(max + 1).padStart(2, '0');
}

/** A single-quoted YAML scalar with inner quotes doubled (`'` -> `''`). */
function quote(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}

/** An inline YAML array (`['A', 'B']`) of single-quoted strings. */
function inlineArray(values: string[]): string {
    return `[${values.map(quote).join(', ')}]`;
}

/**
 * Serialize frontmatter + body into the exact house `.md` style: single-quoted
 * scalars, inline `tags`/`tech` arrays, a nested `series` block, a 4-space-indented
 * `learn` list, optionals omitted when empty, and `draft` only when true. The body
 * is separated by one blank line and ends with a single trailing newline, so parse
 * then serialize round-trips a house-style file byte for byte.
 */
export function serializeArticle(
    frontmatter: ArticleFrontmatter,
    body: string
): string {
    const lines: string[] = [
        `title: ${quote(frontmatter.title)}`,
        `description: ${quote(frontmatter.description)}`,
        `date: ${quote(frontmatter.date)}`,
    ];
    if (frontmatter.updated) lines.push(`updated: ${quote(frontmatter.updated)}`);
    if (frontmatter.tags.length) lines.push(`tags: ${inlineArray(frontmatter.tags)}`);
    if (frontmatter.cover) lines.push(`cover: ${quote(frontmatter.cover)}`);
    if (frontmatter.category) lines.push(`category: ${quote(frontmatter.category)}`);
    if (frontmatter.difficulty)
        lines.push(`difficulty: ${quote(frontmatter.difficulty)}`);
    if (frontmatter.tech.length) lines.push(`tech: ${inlineArray(frontmatter.tech)}`);
    if (frontmatter.series?.name) {
        lines.push('series:');
        lines.push(`    name: ${quote(frontmatter.series.name)}`);
        lines.push(`    order: ${frontmatter.series.order}`);
    }
    if (frontmatter.learn.length) {
        lines.push('learn:');
        for (const item of frontmatter.learn) lines.push(`    - ${quote(item)}`);
    }
    if (frontmatter.draft) lines.push('draft: true');

    const trimmedBody = body.replace(/^\n+/, '').replace(/\s+$/, '');
    return `---\n${lines.join('\n')}\n---\n\n${trimmedBody}\n`;
}

/** A YAML date value as a `YYYY-MM-DD` string (gray-matter may hand back a Date). */
function asDateString(value: unknown): string {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value == null ? '' : String(value);
}

/** A frontmatter list field, keeping only strings, never null. */
function stringList(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];
}

/**
 * Parse a raw `.md` file into structured frontmatter plus body. Reuses
 * `gray-matter`; missing fields fall back to safe empty defaults, and `series` is
 * normalized (or dropped when it has no name).
 */
export function parseArticleFile(raw: string): {
    frontmatter: ArticleFrontmatter;
    body: string;
} {
    const { data, content } = matter(raw);
    const series =
        data.series && typeof data.series.name === 'string'
            ? { name: data.series.name, order: Number(data.series.order) || 0 }
            : undefined;
    const frontmatter: ArticleFrontmatter = {
        title: typeof data.title === 'string' ? data.title : '',
        description: typeof data.description === 'string' ? data.description : '',
        date: asDateString(data.date),
        updated: data.updated ? asDateString(data.updated) : undefined,
        tags: stringList(data.tags),
        cover: typeof data.cover === 'string' ? data.cover : undefined,
        category: typeof data.category === 'string' ? data.category : undefined,
        difficulty: data.difficulty,
        tech: stringList(data.tech),
        learn: stringList(data.learn),
        series,
        draft: data.draft === true ? true : undefined,
    };
    return { frontmatter, body: content.replace(/^\n+/, '').replace(/\s+$/, '') };
}
