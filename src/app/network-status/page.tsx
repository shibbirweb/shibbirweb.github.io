import NetworkStatusStage from '@/components/pages/network-status/NetworkStatusStage';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description = `Network status for ${siteName}'s site: shown when you are offline. Reconnect to load the page, or head back to a page you have already visited.`;

export const metadata = buildPageMetadata({
    title: 'Network status',
    description,
    path: '/network-status',
    // A utility page, never a search result.
    robots: { index: false, follow: false },
});

export default function NetworkStatusPage() {
    return <NetworkStatusStage />;
}
