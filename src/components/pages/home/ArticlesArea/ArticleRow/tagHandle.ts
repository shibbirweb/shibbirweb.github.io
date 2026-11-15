/**
 * Turn an article tag into its compact `#handle` label for the home teaser:
 * lower case, with runs of whitespace joined by a hyphen, so "Database
 * Collation" reads `#database-collation`. Display only; links keep the real tag.
 */
export function tagHandle(tag: string): string {
    return `#${tag.trim().toLowerCase().replace(/\s+/g, '-')}`;
}
