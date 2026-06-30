import type { ArticleFrontmatter } from '@/lib/admin/types';

/**
 * Soft pre-publish checks. Returns a list of human-readable issues; an empty
 * list means the article is ready. These are warnings, not hard blocks, so the
 * editor surfaces them and lets the author publish anyway.
 */
export function validateForPublish(
    frontmatter: ArticleFrontmatter,
    content: string
): string[] {
    const issues: string[] = [];
    if (!frontmatter.title.trim()) issues.push('the title is empty');
    if (!frontmatter.description.trim())
        issues.push('there is no description (used on cards and for SEO)');
    if (!frontmatter.date) issues.push('the published date is not set');
    if (content.trim().length < 30) issues.push('the body looks empty');
    if (frontmatter.tags.length === 0) issues.push('no tags have been added');
    return issues;
}
