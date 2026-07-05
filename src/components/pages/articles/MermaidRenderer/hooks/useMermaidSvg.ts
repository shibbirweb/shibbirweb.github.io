'use client';

import { useEffect, useId, useState } from 'react';
import {
    getResolvedTheme,
    subscribe,
} from '@/components/layout/ThemeToggle/theme';

/**
 * Renders Mermaid source to an SVG string on the client. Mermaid is imported
 * lazily (only when a diagram exists) and re-rendered when the resolved theme
 * changes (an OS scheme flip while on 'system', or a manual switch) so the
 * diagram matches the site. Returns '' until the first render succeeds (or stays
 * '' if the source fails to parse).
 */
export function useMermaidSvg(source: string): string {
    const reactId = useId();
    const [svg, setSvg] = useState('');

    useEffect(() => {
        const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
        let cancelled = false;

        async function render() {
            try {
                const { default: mermaid } = await import('mermaid');
                if (cancelled) return;
                mermaid.initialize({
                    startOnLoad: false,
                    theme: getResolvedTheme() === 'dark' ? 'dark' : 'default',
                });
                const result = await mermaid.render(renderId, source);
                // Drop Mermaid's fixed max-width so pan/zoom can scale the SVG.
                if (!cancelled) {
                    setSvg(result.svg.replace(/max-width:\s*[\d.]+px;?/g, ''));
                }
            } catch {
                if (!cancelled) setSvg('');
            }
        }

        void render();
        const unsubscribe = subscribe(() => void render());
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [source, reactId]);

    return svg;
}
