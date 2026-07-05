import type { Metadata } from 'next';

import {
    getSuggestions,
    listArticles,
} from '@/app/studio/article-editor/actions.dev';
import ArticleEditor from '@/components/pages/article-editor/ArticleEditor';

// Dev-only route: the .dev.tsx extension is recognized as a page only in dev
// (see pageExtensions in next.config.ts), so this never enters the export build.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

// Reads the filesystem at request time (dev server only) for the Open list and the
// form's autocomplete suggestions, then hands them to the client editor, which
// renders its live preview and calls the same Server Actions to save and open.
export default async function ArticleEditorPage() {
    const [existing, suggestions] = await Promise.all([
        listArticles(),
        getSuggestions(),
    ]);
    return (
        <ArticleEditor
            existing={existing}
            suggestions={suggestions}
        />
    );
}
