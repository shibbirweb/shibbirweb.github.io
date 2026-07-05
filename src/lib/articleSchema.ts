// The article frontmatter contract, shared by the production site and the
// dev-only article editor. Pure and node-free (no `node:fs`/`path`) so it is safe
// to import from client components as well as server code.

/** A self-rated difficulty, surfaced as a badge on the article header. */
export type ArticleDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** The fixed difficulty set, in ascending order; drives the editor's `<select>`. */
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

/** One article's place in a multi-part series, declared in its frontmatter. */
export interface ArticleSeries {
    name: string;
    order: number;
}

/** The full set of frontmatter fields an article file can declare. */
export interface ArticleFrontmatter {
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
    cover?: string;
    /** A single grouping label (broader than tags) used to rank related posts. */
    category?: string;
    difficulty?: ArticleDifficulty;
    /** Concrete tools/stack the article builds on, shown as a stack strip. */
    tech: string[];
    /** Key takeaways rendered in the "What you'll learn" card. */
    learn: string[];
    series?: ArticleSeries;
    draft?: boolean;
}
