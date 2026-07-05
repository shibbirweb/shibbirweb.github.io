'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { coverGradientForSlug } from '@/utils/generateArticleCover';
import { pageGradientColors } from '@/utils/pageGradient';
import { usePageGradientOverride } from '@/components/backgrounds/PageGradientBackground/PageGradientProvider';

type GradientColors = readonly [string, string];

/** The single path segment of an `/articles/<slug>` detail route, or null. */
function articleSlugFromPath(pathname: string): string | null {
    const match = pathname.match(/^\/articles\/([^/]+)\/?$/);
    return match ? match[1] : null;
}

/**
 * The wash colours for a route when no page has claimed an override: an article
 * detail route uses its slug's cover gradient (so the wash is already
 * article-coloured on first paint), home is transparent, every other route gets
 * its deterministic per-route colour.
 */
function routeGradientColors(pathname: string): GradientColors {
    const articleSlug = articleSlugFromPath(pathname);
    if (articleSlug) return coverGradientForSlug(articleSlug);
    if (pathname === '/') return ['transparent', 'transparent'];
    const { from, to } = pageGradientColors(pathname);
    return [from, to];
}

/**
 * Full-page gradient wash shown on every page except the home page (which paints
 * its own section swells). It is absolutely positioned over the relative body,
 * so it spans the whole document and scrolls with the page. The actual gradient
 * (and its light/dark tuning) lives in the `.page-gradient` rule in globals.css;
 * here we only feed it the two accent colours via CSS variables.
 *
 * Colours are chosen in priority order:
 *  1. an override a page has claimed (`SyncPageGradient`), e.g. an article's exact
 *     cover colours, so the wash matches that page's own accent;
 *  2. an `/articles/<slug>` detail route with no override yet: the slug's cover
 *     gradient, so the wash is already article-coloured on first paint (no flash);
 *  3. otherwise the deterministic per-route colour (transparent on home).
 *
 * The element stays mounted on every route (transparent on home) rather than
 * unmounting, so the registered colour properties transition on navigation and
 * the wash cross-fades smoothly in/out and between pages (see globals.css).
 */
export default function PageGradientBackground() {
    const pathname = usePathname();
    const { override } = usePageGradientOverride();

    const [from, to] = override ?? routeGradientColors(pathname);

    return (
        <div
            aria-hidden="true"
            className="page-gradient pointer-events-none absolute inset-0 -z-10"
            style={
                {
                    '--page-grad-from': from,
                    '--page-grad-to': to,
                } as CSSProperties
            }
        />
    );
}
