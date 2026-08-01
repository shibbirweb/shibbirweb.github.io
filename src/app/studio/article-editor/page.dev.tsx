import type { Metadata } from 'next';

import {
    deleteArticle,
    getSuggestions,
    listArticles,
    loadArticle,
    saveArticle,
} from '@/app/studio/article-editor/actions.dev';
import ArticleEditor from '@/components/pages/article-editor/ArticleEditor';
import type { EditorActions } from '@/components/pages/article-editor/ArticleEditor/types';

// Dev-only route: the .dev.tsx extension is recognized as a page only in dev
// (see pageExtensions in next.config.ts), so this never enters the export build.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

// The editor's filesystem operations, handed down rather than imported: the client
// tree lives in `src/components/`, which must not reach into `src/app/`. Server
// Action references are serialisable, so they cross the boundary as plain props.
const editorActions: EditorActions = {
    listArticles,
    loadArticle,
    saveArticle,
    deleteArticle,
    getSuggestions,
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
            actions={editorActions}
            existing={existing}
            suggestions={suggestions}
        />
    );
}
