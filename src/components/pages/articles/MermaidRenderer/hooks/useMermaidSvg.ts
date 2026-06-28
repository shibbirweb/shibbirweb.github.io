'use client';

import { useEffect, useId, useState } from 'react';

/**
 * Renders Mermaid source to an SVG string on the client. Mermaid is imported
 * lazily (only when a diagram exists) and re-rendered when the system colour
 * scheme changes so the diagram matches the site theme. Returns '' until the
 * first render succeeds (or stays '' if the source fails to parse).
 */
export function useMermaidSvg(source: string): string {
    const reactId = useId();
    const [svg, setSvg] = useState('');

    useEffect(() => {
        const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
        const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        let cancelled = false;

        async function render() {
            try {
                const { default: mermaid } = await import('mermaid');
                if (cancelled) return;
                mermaid.initialize({
                    startOnLoad: false,
                    theme: darkScheme.matches ? 'dark' : 'default',
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
        const onSchemeChange = () => void render();
        darkScheme.addEventListener('change', onSchemeChange);
        return () => {
            cancelled = true;
            darkScheme.removeEventListener('change', onSchemeChange);
        };
    }, [source, reactId]);

    return svg;
}
