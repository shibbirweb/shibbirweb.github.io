import type { ArticleFrontmatter } from '@/lib/admin/types';
import type { ArticleDifficulty } from '@/lib/posts';

/**
 * Frontmatter serialization for the Article Studio.
 *
 * Files are *parsed* with gray-matter (any valid YAML), but *written* with this
 * curated serializer so generated Markdown stays clean and consistent with the
 * repo's hand-authored style: single-quoted scalars, inline string arrays, a
 * stable key order, and 4-space nested indentation. Optional fields are emitted
 * only when meaningful, so a published file never carries empty `draft:` noise.
 */

const DIFFICULTIES: readonly ArticleDifficulty[] = [
    'Beginner',
    'Intermediate',
    'Advanced',
];

/** Coerce loosely-typed parsed YAML into a complete, normalized frontmatter. */
export function normalizeFrontmatter(
    data: Record<string, unknown>,
    fallbackTitle: string
): ArticleFrontmatter {
    const series = data.series as { name?: unknown; order?: unknown } | undefined;
    const difficulty =
        typeof data.difficulty === 'string' &&
        DIFFICULTIES.includes(data.difficulty as ArticleDifficulty)
            ? (data.difficulty as ArticleDifficulty)
            : undefined;

    return {
        title: asString(data.title) || fallbackTitle,
        description: asString(data.description),
        date: asString(data.date),
        updated: asString(data.updated) || undefined,
        tags: asStringList(data.tags),
        category: asString(data.category) || undefined,
        difficulty,
        featured: data.featured === true,
        draft: data.draft === true ? true : undefined,
        tech: asStringList(data.tech),
        learn: asStringList(data.learn),
        series:
            series && typeof series.name === 'string' && series.name.trim()
                ? { name: series.name.trim(), order: Number(series.order) || 0 }
                : undefined,
        cover: asString(data.cover) || undefined,
        canonical: asString(data.canonical) || undefined,
        keywords: asStringList(data.keywords),
    };
}

/** Serialize a full Markdown file (frontmatter block + body). */
export function stringifyArticle(
    frontmatter: ArticleFrontmatter,
    content: string
): string {
    const lines: string[] = ['---'];

    push(lines, 'title', scalar(frontmatter.title));
    push(lines, 'description', scalar(frontmatter.description));
    push(lines, 'date', scalar(frontmatter.date));
    if (frontmatter.updated) push(lines, 'updated', scalar(frontmatter.updated));
    if (frontmatter.tags.length) push(lines, 'tags', inlineList(frontmatter.tags));
    if (frontmatter.cover) push(lines, 'cover', scalar(frontmatter.cover));
    if (frontmatter.category)
        push(lines, 'category', scalar(frontmatter.category));
    if (frontmatter.difficulty)
        push(lines, 'difficulty', scalar(frontmatter.difficulty));
    if (frontmatter.featured) push(lines, 'featured', 'true');
    if (frontmatter.draft) push(lines, 'draft', 'true');
    if (frontmatter.tech.length) push(lines, 'tech', inlineList(frontmatter.tech));
    if (frontmatter.learn.length) {
        lines.push('learn:');
        for (const item of frontmatter.learn) lines.push(`    - ${scalar(item)}`);
    }
    if (frontmatter.series) {
        lines.push('series:');
        lines.push(`    name: ${scalar(frontmatter.series.name)}`);
        lines.push(`    order: ${Number(frontmatter.series.order) || 0}`);
    }
    if (frontmatter.canonical)
        push(lines, 'canonical', scalar(frontmatter.canonical));
    if (frontmatter.keywords.length)
        push(lines, 'keywords', inlineList(frontmatter.keywords));

    lines.push('---', '');
    return `${lines.join('\n')}\n${content.replace(/^\s+/, '')}\n`.replace(
        /\n+$/,
        '\n'
    );
}

function push(lines: string[], key: string, value: string): void {
    lines.push(`${key}: ${value}`);
}

/** A single-quoted YAML scalar; internal single quotes are doubled per spec. */
function scalar(value: string): string {
    return `'${String(value).replace(/\r?\n/g, ' ').replace(/'/g, "''")}'`;
}

/** An inline flow sequence of single-quoted scalars: `['a', 'b']`. */
function inlineList(values: string[]): string {
    return `[${values.map(scalar).join(', ')}]`;
}

function asString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    return '';
}

function asStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => asString(item).trim())
        .filter((item) => item.length > 0);
}
