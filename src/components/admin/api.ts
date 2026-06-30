import type {
    ArticleDetail,
    ArticleFrontmatter,
    ArticleListItem,
    StudioMeta,
} from '@/lib/admin/types';
import type { TocItem } from '@/lib/posts';

/**
 * Typed client for the dev-only Article Studio API. Every Studio component talks
 * to the filesystem through these functions, never `fetch` directly, so error
 * handling and request shapes stay in one place.
 */

const BASE = '/api/admin/articles';

export class StudioApiError extends Error {
    constructor(
        message: string,
        readonly status: number
    ) {
        super(message);
        this.name = 'StudioApiError';
    }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        headers: init?.body
            ? { 'Content-Type': 'application/json', ...init?.headers }
            : init?.headers,
    });
    const data = (await response.json().catch(() => ({}))) as T & {
        error?: string;
    };
    if (!response.ok) {
        throw new StudioApiError(
            data?.error || `Request failed (${response.status})`,
            response.status
        );
    }
    return data as T;
}

export function fetchArticles(): Promise<{ articles: ArticleListItem[] }> {
    return request(`${BASE}`, { cache: 'no-store' });
}

export function fetchArticle(id: string): Promise<{ article: ArticleDetail }> {
    return request(`${BASE}/entry?id=${encodeURIComponent(id)}`, {
        cache: 'no-store',
    });
}

export function fetchMeta(): Promise<StudioMeta> {
    return request(`${BASE}/meta`, { cache: 'no-store' });
}

export function createArticle(title?: string): Promise<{ id: string }> {
    return request(`${BASE}`, {
        method: 'POST',
        body: JSON.stringify({ title }),
    });
}

export function saveArticle(payload: {
    id: string;
    frontmatter: ArticleFrontmatter;
    content: string;
    slug?: string;
}): Promise<{ id: string }> {
    return request(`${BASE}/entry`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export function deleteArticle(id: string): Promise<{ trashed: string }> {
    return request(`${BASE}/entry?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

type LifecycleAction = 'publish' | 'unpublish' | 'duplicate';

export function articleAction(
    id: string,
    action: LifecycleAction
): Promise<{ id: string }> {
    return request(`${BASE}/entry`, {
        method: 'PATCH',
        body: JSON.stringify({ id, action }),
    });
}

export function renderPreview(
    content: string,
    signal?: AbortSignal
): Promise<{ html: string; toc: TocItem[] }> {
    return request(`${BASE}/preview`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        signal,
    });
}

export async function uploadImage(file: File): Promise<{ path: string }> {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${BASE}/upload`, {
        method: 'POST',
        body: form,
    });
    const data = (await response.json().catch(() => ({}))) as {
        path?: string;
        error?: string;
    };
    if (!response.ok || !data.path) {
        throw new StudioApiError(
            data?.error || 'Upload failed',
            response.status
        );
    }
    return { path: data.path };
}
