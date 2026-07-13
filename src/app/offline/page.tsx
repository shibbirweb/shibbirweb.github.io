import OfflineStage from '@/components/pages/offline/OfflineStage';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description = `You appear to be offline. Reconnect to load the page, or head back to a page you have already visited on ${siteName}'s site.`;

export const metadata = buildPageMetadata({
    title: 'Offline',
    description,
    path: '/offline',
    // A utility page, never a search result.
    robots: { index: false, follow: false },
});

export default function OfflinePage() {
    return <OfflineStage />;
}
