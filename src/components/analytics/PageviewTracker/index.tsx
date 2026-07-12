'use client';

import { usePageviewTracking } from '@/components/analytics/PageviewTracker/hooks/usePageviewTracking';

/**
 * Renders nothing. Emits GTM `page_view` (and `article_view` on article detail
 * routes) events on each App Router navigation. Mount once, prod-gated, beside
 * the GTM snippet in the root layout.
 */
export default function PageviewTracker() {
    usePageviewTracking();
    return null;
}
