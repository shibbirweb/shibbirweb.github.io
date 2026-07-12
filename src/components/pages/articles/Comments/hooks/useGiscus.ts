'use client';

import { useEffect, type RefObject } from 'react';
import {
    getResolvedTheme,
    subscribe,
} from '@/components/layout/ThemeToggle/theme';

const GISCUS_ORIGIN = 'https://giscus.app';

/** The four giscus embed parameters, sourced from `@/config/constants`. */
export interface GiscusConfig {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
}

/**
 * The giscus theme value: a full, origin-derived URL to the site's custom giscus
 * theme stylesheet (`/giscus-light.css` or `/giscus-dark.css` in `public/`) for
 * the resolved site theme, so the widget matches the site design system (a
 * ProjectCard-style card). Origin-derived so dev and prod each point at their own
 * host; runs in a client effect, so `window` is available.
 *
 * Giscus applies the theme by injecting a `<link rel="stylesheet" href=...>` into
 * its own https iframe, so the URL must resolve over https: production
 * (`https://shibbir.me/...`) and `pnpm dev:https` work; plain http `pnpm dev`
 * blocks the http-origin stylesheet as mixed content and the widget falls back to
 * its unstyled default.
 */
function themeFor(): string {
    const mode = getResolvedTheme() === 'dark' ? 'dark' : 'light';
    return `${window.location.origin}/giscus-${mode}.css`;
}

/**
 * Injects the giscus client script into `containerRef` and keeps the widget's
 * theme in sync with the site. The script is (re)appended on mount and the
 * container is cleared on cleanup so a re-mount never double-injects. Live theme
 * changes reach the already-loaded iframe through a `postMessage` `setConfig`,
 * mirroring how the Mermaid renderer re-themes on `subscribe()`.
 */
export function useGiscus(
    containerRef: RefObject<HTMLElement | null>,
    config: GiscusConfig
): void {
    const { repo, repoId, category, categoryId } = config;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const script = document.createElement('script');
        script.src = `${GISCUS_ORIGIN}/client.js`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-repo', repo);
        script.setAttribute('data-repo-id', repoId);
        script.setAttribute('data-category', category);
        script.setAttribute('data-category-id', categoryId);
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-loading', 'lazy');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-lang', 'en');
        script.setAttribute('data-theme', themeFor());
        container.appendChild(script);

        const unsubscribe = subscribe(() => {
            const frame =
                container.querySelector<HTMLIFrameElement>(
                    'iframe.giscus-frame'
                );
            frame?.contentWindow?.postMessage(
                { giscus: { setConfig: { theme: themeFor() } } },
                GISCUS_ORIGIN
            );
        });

        return () => {
            unsubscribe();
            container.replaceChildren();
        };
    }, [containerRef, repo, repoId, category, categoryId]);
}
