'use client';

import { useState } from 'react';
import {
    getSuggestions,
    listArticles,
    loadArticle,
    saveArticle,
} from '@/app/studio/article-editor/actions.dev';
import type {
    ArticleDraft,
    ArticleListItem,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';

/** The save button's transient state, surfaced in the save bar. */
export type SaveState =
    | { status: 'idle' }
    | { status: 'saving' }
    | { status: 'saved'; message: string }
    | { status: 'error'; message: string };

/**
 * Owns the editor's dev-only Server Action calls: the live article list and
 * suggestion sets (seeded from the page's server props, refreshed after a save so
 * a newly written file and any freshly coined tag appear at once), plus `save` and
 * `open` with the save button's pending/saved/error state.
 */
export function useArticleActions(
    initialArticles: ArticleListItem[],
    initialSuggestions: EditorSuggestions
) {
    const [articles, setArticles] = useState(initialArticles);
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });

    async function save(draft: ArticleDraft, slug: string) {
        setSaveState({ status: 'saving' });
        try {
            const result = await saveArticle(draft, slug);
            const [nextArticles, nextSuggestions] = await Promise.all([
                listArticles(),
                getSuggestions(),
            ]);
            setArticles(nextArticles);
            setSuggestions(nextSuggestions);
            setSaveState({
                status: 'saved',
                message: `Saved ${result.file} (${result.status})`,
            });
            return result;
        } catch (error) {
            setSaveState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Save failed',
            });
            return null;
        }
    }

    async function open(file: string): Promise<ArticleDraft> {
        return loadArticle(file);
    }

    return { articles, suggestions, saveState, save, open };
}
