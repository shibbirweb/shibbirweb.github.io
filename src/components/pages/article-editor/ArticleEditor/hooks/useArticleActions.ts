'use client';

import { useState } from 'react';
import type {
    ArticleDraft,
    ArticleListItem,
    EditorActions,
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
 *
 * The actions arrive as a parameter rather than an import: they live beside the
 * studio route in `src/app/`, which this side of the tree must not reach into.
 */
export function useArticleActions(
    actions: EditorActions,
    initialArticles: ArticleListItem[],
    initialSuggestions: EditorSuggestions
) {
    const [articles, setArticles] = useState(initialArticles);
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });

    /** Re-read both server-owned lists, so a new file and any new tag land together. */
    async function refreshLists() {
        const [nextArticles, nextSuggestions] = await Promise.all([
            actions.listArticles(),
            actions.getSuggestions(),
        ]);
        setArticles(nextArticles);
        setSuggestions(nextSuggestions);
    }

    async function save(draft: ArticleDraft, slug: string) {
        setSaveState({ status: 'saving' });
        try {
            const result = await actions.saveArticle(draft, slug);
            await refreshLists();
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
        return actions.loadArticle(file);
    }

    async function remove(slug: string) {
        setSaveState({ status: 'saving' });
        try {
            const result = await actions.deleteArticle(slug);
            await refreshLists();
            setSaveState({
                status: 'saved',
                message: result.removed.length
                    ? `Deleted ${result.removed.join(', ')}`
                    : 'Nothing to delete',
            });
            return result;
        } catch (error) {
            setSaveState({
                status: 'error',
                message:
                    error instanceof Error ? error.message : 'Delete failed',
            });
            return null;
        }
    }

    return { articles, suggestions, saveState, save, open, remove };
}
