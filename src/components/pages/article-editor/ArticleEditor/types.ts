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

/**
 * The filesystem operations the editor needs, as a contract rather than an import.
 * The implementations are dev-only Server Actions living beside the studio route,
 * and the route passes them in: `src/components/` must never import from
 * `src/app/`, so this interface is where the two sides meet.
 */
export interface EditorActions {
    listArticles: () => Promise<ArticleListItem[]>;
    loadArticle: (file: string) => Promise<ArticleDraft>;
    saveArticle: (
        input: ArticleDraft,
        slugOverride: string
    ) => Promise<{ file: string; status: ArticleListItem['status'] }>;
    deleteArticle: (slug: string) => Promise<{ removed: string[] }>;
    getSuggestions: () => Promise<EditorSuggestions>;
}
