import { useEffect, useRef, useState } from 'react';
import { renderMarkdown, type TocItem } from '@/lib/markdown';

/**
 * Renders the article body to HTML with the same production pipeline (Shiki,
 * gist, Mermaid, heading ids/TOC) used on the live site, debounced so fast
 * typing does not re-run Shiki on every keystroke. A request id drops stale
 * results if the body changes mid-render. `renderKey` bumps whenever the html
 * changes so the DOM upgraders (Mermaid/copy/lightbox) can remount and re-scan.
 */
export function useMarkdownPreview(body: string) {
    const [result, setResult] = useState<{ html: string; toc: TocItem[] }>({
        html: '',
        toc: [],
    });
    const [renderKey, setRenderKey] = useState(0);
    const requestRef = useRef(0);

    useEffect(() => {
        const requestId = ++requestRef.current;
        const timer = setTimeout(async () => {
            const next = await renderMarkdown(body);
            if (requestId !== requestRef.current) return;
            setResult(next);
            setRenderKey((key) => key + 1);
        }, 300);
        return () => clearTimeout(timer);
    }, [body]);

    return { html: result.html, toc: result.toc, renderKey };
}
