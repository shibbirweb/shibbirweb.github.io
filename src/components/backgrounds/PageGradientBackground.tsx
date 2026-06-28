'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { pageGradientColors } from '@/utils/pageGradient';

/**
 * Full-page gradient wash shown on every page except the home page (which paints
 * its own section swells). It is absolutely positioned over the relative body,
 * so it spans the whole document and scrolls with the page. The accent colours
 * are derived
 * deterministically from the current route, so each page gets its own gradient
 * and any new route is assigned one automatically. The actual gradient (and its
 * light/dark tuning) lives in the `.page-gradient` rule in globals.css; here we
 * only feed it the per-route colours via CSS variables.
 *
 * The element stays mounted on every route (transparent on home) rather than
 * unmounting, so the registered colour properties transition on navigation and
 * the wash cross-fades smoothly in/out and between pages (see globals.css).
 */
export default function PageGradientBackground() {
    const pathname = usePathname();
    const { from, to } =
        pathname === '/'
            ? { from: 'transparent', to: 'transparent' }
            : pageGradientColors(pathname);

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
