'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchArticles, fetchMeta } from '@/components/admin/api';
import type { ArticleListItem, StudioMeta } from '@/lib/admin/types';

const EMPTY_META: StudioMeta = { tags: [], categories: [], series: [] };

/** Loads the dashboard's articles and picker metadata, with a `reload()`. */
export function useArticles() {
    const [articles, setArticles] = useState<ArticleListItem[]>([]);
    const [meta, setMeta] = useState<StudioMeta>(EMPTY_META);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            const [list, metaResponse] = await Promise.all([
                fetchArticles(),
                fetchMeta(),
            ]);
            setArticles(list.articles);
            setMeta(metaResponse);
            setError(null);
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : 'Failed to load'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    return { articles, meta, loading, error, reload };
}
