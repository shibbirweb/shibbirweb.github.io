export type ArticleDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ArticleFrontmatter {
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
    cover?: string;
    category?: string;
    difficulty?: ArticleDifficulty;
    tech: string[];
    learn: string[];
    series?: {
        name: string;
        order: number;
    };
    draft: boolean;
}

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
