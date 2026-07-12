import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { sendGTMEvent } from '@next/third-parties/google';

/** Matches an individual article detail route (`/articles/<slug>`), capturing the slug. */
const articleDetailPattern = /^\/articles\/([^/]+)$/;

/** Segments under `/articles/` that are routes, not article slugs. */
const reservedArticleSegments = new Set(['search']);

/**
 * Pushes a `page_view` GTM event on initial load and on every client-side route
 * change, plus a distinct `article_view` event when the route is an article
 * detail page. Path-level only (no query string). GTM (and any downstream GA4
 * tags) exist only in production, so mount this behind the same prod gate.
 */
export function usePageviewTracking() {
    const pathname = usePathname();

    useEffect(() => {
        const pageTitle = document.title;

        sendGTMEvent({
            event: 'page_view',
            page_path: pathname,
            page_title: pageTitle,
        });

        const articleMatch = pathname.match(articleDetailPattern);
        const articleSlug = articleMatch?.[1];

        if (articleSlug && !reservedArticleSegments.has(articleSlug)) {
            sendGTMEvent({
                event: 'article_view',
                article_slug: articleSlug,
                article_title: pageTitle,
            });
        }
    }, [pathname]);
}
