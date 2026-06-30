'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    articleAction,
    fetchArticle,
    saveArticle,
} from '@/components/admin/api';
import { editorHref } from '@/components/admin/Dashboard/links';
import type {
    ArticleDetail,
    ArticleFrontmatter,
    ArticleStatus,
} from '@/lib/admin/types';

type LoadState = 'loading' | 'ready' | 'error';
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const EMPTY_FRONTMATTER: ArticleFrontmatter = {
    title: '',
    description: '',
    date: '',
    tags: [],
    tech: [],
    learn: [],
    keywords: [],
};

interface Snapshot {
    frontmatter: ArticleFrontmatter;
    content: string;
    slug: string;
}

const serialize = (snapshot: Snapshot) => JSON.stringify(snapshot);
const message = (caught: unknown) =>
    caught instanceof Error ? caught.message : 'Something went wrong';

/**
 * The editor's single source of truth: loads an article, tracks edits against a
 * baseline (so we know when it is dirty), autosaves after a pause, and runs the
 * publish / unpublish transitions (which persist first, then move the file).
 * After a rename or move the article id changes, so the browser URL is kept in
 * sync without a full navigation.
 */
export function useArticleDraft(initialId: string | null) {
    const [id, setId] = useState<string | null>(initialId);
    const [loadState, setLoadState] = useState<LoadState>(
        initialId ? 'loading' : 'error'
    );
    const [loadError, setLoadError] = useState<string | null>(
        initialId ? null : 'No article selected.'
    );
    const [status, setStatus] = useState<ArticleStatus>('draft');
    const [frontmatter, setFrontmatterState] =
        useState<ArticleFrontmatter>(EMPTY_FRONTMATTER);
    const [content, setContent] = useState('');
    const [slug, setSlug] = useState('');
    const [baseline, setBaseline] = useState('');
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

    const dirty = serialize({ frontmatter, content, slug }) !== baseline;

    // A "latest" mirror so the save chain always persists the newest edits, even
    // when it was scheduled (autosave) before the most recent keystroke.
    const latestRef = useRef({ id, frontmatter, content, slug });
    latestRef.current = { id, frontmatter, content, slug };
    // Mirror of the last-saved snapshot, so a queued save can skip an
    // already-up-to-date write (e.g. autosave firing right after a manual save).
    const baselineRef = useRef(baseline);
    baselineRef.current = baseline;
    // Writes run through this promise chain, so they never overlap and a
    // publish/unpublish that awaits save() is guaranteed the freshest content.
    const writeChainRef = useRef<Promise<string>>(Promise.resolve(''));

    const applyArticle = useCallback((article: ArticleDetail) => {
        setId(article.id);
        setStatus(article.status);
        setFrontmatterState(article.frontmatter);
        setContent(article.content);
        setSlug(article.slug);
        setBaseline(
            serialize({
                frontmatter: article.frontmatter,
                content: article.content,
                slug: article.slug,
            })
        );
        setLastSavedAt(new Date(article.lastModified).getTime());
        setSaveState('idle');
    }, []);

    const load = useCallback(
        async (targetId: string) => {
            setLoadState('loading');
            try {
                const { article } = await fetchArticle(targetId);
                applyArticle(article);
                setLoadState('ready');
            } catch (caught) {
                setLoadError(message(caught));
                setLoadState('error');
            }
        },
        [applyArticle]
    );

    useEffect(() => {
        if (initialId) load(initialId);
    }, [initialId, load]);

    const setFrontmatter = useCallback(
        (patch: Partial<ArticleFrontmatter>) =>
            setFrontmatterState((current) => ({ ...current, ...patch })),
        []
    );

    const performSave = useCallback(async (): Promise<string> => {
        const {
            id: currentId,
            frontmatter: currentFrontmatter,
            content: currentContent,
            slug: currentSlug,
        } = latestRef.current;
        if (!currentId) throw new Error('No article loaded');
        // Skip redundant writes (a queued save whose content is already saved).
        const snapshot = serialize({
            frontmatter: currentFrontmatter,
            content: currentContent,
            slug: currentSlug,
        });
        if (snapshot === baselineRef.current) return currentId;
        setSaveState('saving');
        try {
            const { id: nextId } = await saveArticle({
                id: currentId,
                frontmatter: currentFrontmatter,
                content: currentContent,
                slug: currentSlug,
            });
            setBaseline(
                serialize({
                    frontmatter: currentFrontmatter,
                    content: currentContent,
                    slug: currentSlug,
                })
            );
            setLastSavedAt(Date.now());
            setSaveState('saved');
            if (nextId !== currentId) {
                setId(nextId);
                latestRef.current.id = nextId;
                window.history.replaceState(null, '', editorHref(nextId));
            }
            return nextId;
        } catch (caught) {
            setSaveState('error');
            throw caught;
        }
    }, []);

    // Every save links onto the chain, so writes serialize and each one persists
    // the latest mirror at the moment it runs (never a stale snapshot).
    const save = useCallback((): Promise<string> => {
        const result = writeChainRef.current.then(performSave, performSave);
        writeChainRef.current = result.then(
            (savedId) => savedId,
            () => latestRef.current.id ?? ''
        );
        return result;
    }, [performSave]);

    // Autosave: a quiet 1.2s after the last edit; a clean draft never saves.
    const saveRef = useRef(save);
    saveRef.current = save;
    useEffect(() => {
        if (loadState !== 'ready' || !dirty) return;
        const timer = setTimeout(() => {
            saveRef.current().catch(() => {
                /* surfaced via saveState */
            });
        }, 1200);
        return () => clearTimeout(timer);
    }, [dirty, loadState, frontmatter, content, slug]);

    const transition = useCallback(
        async (action: 'publish' | 'unpublish') => {
            // Flush the latest edits first so the moved file is current.
            await save();
            const savedId = latestRef.current.id;
            if (!savedId) throw new Error('No article loaded');
            const { id: nextId } = await articleAction(savedId, action);
            await load(nextId);
        },
        [save, load]
    );

    return {
        id,
        loadState,
        loadError,
        status,
        frontmatter,
        setFrontmatter,
        content,
        setContent,
        slug,
        setSlug,
        dirty,
        saveState,
        lastSavedAt,
        save,
        publish: () => transition('publish'),
        unpublish: () => transition('unpublish'),
        reload: () => (id ? load(id) : Promise.resolve()),
    };
}

export type ArticleDraft = ReturnType<typeof useArticleDraft>;
