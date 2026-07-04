// The frontmatter schema is the single source in `@/lib/articleSchema`; re-exported
// here so editor components keep importing it from their local `types` module.
export type {
    ArticleDifficulty,
    ArticleFrontmatter,
} from '@/lib/articleSchema';

import type { ArticleFrontmatter } from '@/lib/articleSchema';

export interface ArticleDraft {
    frontmatter: ArticleFrontmatter;
    body: string;
}

export interface ArticleListItem {
    file: string;
    slug: string;
    title: string;
    status: 'published' | 'draft';
}

export interface EditorSuggestions {
    tags: string[];
    categories: string[];
    seriesNames: string[];
    tech: string[];
}
