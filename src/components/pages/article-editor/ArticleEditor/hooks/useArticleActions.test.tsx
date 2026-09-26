import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useArticleActions } from '@/components/pages/article-editor/ArticleEditor/hooks/useArticleActions';
import type {
    ArticleDraft,
    ArticleListItem,
    EditorActions,
    EditorSuggestions,
} from '@/components/pages/article-editor/ArticleEditor/types';

const initialArticles: ArticleListItem[] = [
    {
        file: '01-first-post.md',
        slug: 'first-post',
        title: 'First post',
        status: 'published',
    },
];
const initialSuggestions: EditorSuggestions = {
    tags: ['AI'],
    categories: [],
    seriesNames: [],
    tech: [],
};
const refreshedArticles: ArticleListItem[] = [
    ...initialArticles,
    {
        file: '02-second-post.md',
        slug: 'second-post',
        title: 'Second post',
        status: 'draft',
    },
];
const refreshedSuggestions: EditorSuggestions = {
    ...initialSuggestions,
    tags: ['AI', 'Docker'],
};

const draft: ArticleDraft = {
    frontmatter: {
        title: 'Second post',
        description: '',
        date: '2026-05-01',
        tags: ['Docker'],
        tech: [],
        learn: [],
        draft: true,
    },
    body: 'Hello',
};

/** An in-memory stand-in for the dev-only Server Actions. */
function fakeActions(overrides: Partial<EditorActions> = {}): EditorActions {
    return {
        listArticles: vi.fn().mockResolvedValue(refreshedArticles),
        loadArticle: vi.fn().mockResolvedValue(draft),
        saveArticle: vi
            .fn()
            .mockResolvedValue({ file: '02-second-post.md', status: 'draft' }),
        deleteArticle: vi
            .fn()
            .mockResolvedValue({ removed: ['02-second-post.md'] }),
        getSuggestions: vi.fn().mockResolvedValue(refreshedSuggestions),
        ...overrides,
    };
}

function renderActions(actions: EditorActions) {
    return renderHook(() =>
        useArticleActions(actions, initialArticles, initialSuggestions)
    );
}

describe('useArticleActions', () => {
    it('seeds the lists from the server props and starts idle', () => {
        const { result } = renderActions(fakeActions());

        expect(result.current.articles).toBe(initialArticles);
        expect(result.current.suggestions).toBe(initialSuggestions);
        expect(result.current.saveState).toEqual({ status: 'idle' });
    });

    it('saves, refreshes both lists, and reports the saved file', async () => {
        const actions = fakeActions();
        const { result } = renderActions(actions);

        let saved: Awaited<ReturnType<typeof result.current.save>> = null;
        await act(async () => {
            saved = await result.current.save(draft, 'second-post');
        });

        expect(actions.saveArticle).toHaveBeenCalledWith(draft, 'second-post');
        expect(saved).toEqual({ file: '02-second-post.md', status: 'draft' });
        expect(result.current.articles).toEqual(refreshedArticles);
        expect(result.current.suggestions).toEqual(refreshedSuggestions);
        expect(result.current.saveState).toEqual({
            status: 'saved',
            message: 'Saved 02-second-post.md (draft)',
        });
    });

    it('shows the saving state while the save is in flight', async () => {
        type SaveResult = Awaited<ReturnType<EditorActions['saveArticle']>>;
        let finishSave: (value: SaveResult) => void = () => {};
        const actions = fakeActions({
            saveArticle: vi.fn(
                () =>
                    new Promise<SaveResult>((resolve) => {
                        finishSave = resolve;
                    })
            ),
        });
        const { result } = renderActions(actions);

        let pending: Promise<unknown> = Promise.resolve();
        act(() => {
            pending = result.current.save(draft, 'second-post');
        });
        expect(result.current.saveState).toEqual({ status: 'saving' });

        await act(async () => {
            finishSave({ file: '02-second-post.md', status: 'draft' });
            await pending;
        });
        expect(result.current.saveState.status).toBe('saved');
    });

    it('surfaces a failed save as an error and returns null', async () => {
        const actions = fakeActions({
            saveArticle: vi
                .fn()
                .mockRejectedValue(new Error('Title is required')),
        });
        const { result } = renderActions(actions);

        let saved: unknown = 'unset';
        await act(async () => {
            saved = await result.current.save(draft, 'second-post');
        });

        expect(saved).toBeNull();
        expect(result.current.saveState).toEqual({
            status: 'error',
            message: 'Title is required',
        });
        expect(actions.listArticles).not.toHaveBeenCalled();
    });

    it('falls back to a generic message for a non-Error rejection', async () => {
        const actions = fakeActions({
            saveArticle: vi.fn().mockRejectedValue('nope'),
        });
        const { result } = renderActions(actions);

        await act(async () => {
            await result.current.save(draft, 'second-post');
        });

        expect(result.current.saveState).toEqual({
            status: 'error',
            message: 'Save failed',
        });
    });

    it('opens a file through loadArticle', async () => {
        const actions = fakeActions();
        const { result } = renderActions(actions);

        const loaded = await result.current.open('02-second-post.md');

        expect(actions.loadArticle).toHaveBeenCalledWith('02-second-post.md');
        expect(loaded).toBe(draft);
    });

    it('deletes by slug, refreshes, and lists the removed files', async () => {
        const actions = fakeActions();
        const { result } = renderActions(actions);

        await act(async () => {
            await result.current.remove('second-post');
        });

        expect(actions.deleteArticle).toHaveBeenCalledWith('second-post');
        expect(actions.listArticles).toHaveBeenCalled();
        expect(result.current.saveState).toEqual({
            status: 'saved',
            message: 'Deleted 02-second-post.md',
        });
    });

    it('says when there was nothing to delete', async () => {
        const actions = fakeActions({
            deleteArticle: vi.fn().mockResolvedValue({ removed: [] }),
        });
        const { result } = renderActions(actions);

        await act(async () => {
            await result.current.remove('missing');
        });

        expect(result.current.saveState).toEqual({
            status: 'saved',
            message: 'Nothing to delete',
        });
    });

    it('surfaces a failed delete as an error and returns null', async () => {
        const actions = fakeActions({
            deleteArticle: vi.fn().mockRejectedValue(new Error('EACCES')),
        });
        const { result } = renderActions(actions);

        let removed: unknown = 'unset';
        await act(async () => {
            removed = await result.current.remove('second-post');
        });

        expect(removed).toBeNull();
        expect(result.current.saveState).toEqual({
            status: 'error',
            message: 'EACCES',
        });
    });
});
