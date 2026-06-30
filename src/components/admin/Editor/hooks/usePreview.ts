'use client';

import { useEffect, useState } from 'react';
import { renderPreview } from '@/components/admin/api';

interface PreviewResult {
    html: string;
    loading: boolean;
    error: string | null;
}

/**
 * Render `content` to production HTML through the preview endpoint, debounced so
 * fast typing does not flood the server. Only runs while `enabled`, so the split
 * and preview modes pay for rendering and the plain editor mode does not.
 */
export function usePreview(content: string, enabled: boolean): PreviewResult {
    const [html, setHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const result = await renderPreview(content, controller.signal);
                setHtml(result.html);
                setError(null);
                setLoading(false);
            } catch (caught) {
                // An aborted request was superseded by a newer keystroke, which
                // already turned the spinner back on; leave it for that request.
                if ((caught as Error)?.name !== 'AbortError') {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : 'Preview failed'
                    );
                    setLoading(false);
                }
            }
        }, 400);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [content, enabled]);

    return { html, loading, error };
}
