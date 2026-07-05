import type { ArticleDraft } from '@/components/pages/article-editor/ArticleEditor/types';

/** Body a fresh article starts from: an intro line above the first section. */
export const STARTER_BODY = `Open with a short intro that frames the problem before the first heading.

## First section

Start writing here.`;

/** A blank draft for "New article": empty fields, today's date, starter body. */
export function createEmptyDraft(): ArticleDraft {
    const today = new Date().toISOString().slice(0, 10);
    return {
        frontmatter: {
            title: '',
            description: '',
            date: today,
            tags: [],
            tech: [],
            learn: [],
            draft: false,
        },
        body: STARTER_BODY,
    };
}
