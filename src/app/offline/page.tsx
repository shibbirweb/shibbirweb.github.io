import SectionHeading from '@/components/pages/common/SectionHeading';
import OfflineActions from '@/components/pages/offline/OfflineActions';
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
    return (
        <main className="relative container mx-auto flex grow flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:py-28">
            {/* Faint display-face watermark behind the message, purely decorative. */}
            <span
                aria-hidden="true"
                className="text-foreground/[0.04] font-display pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 text-[28vw] leading-none font-black tracking-tighter select-none"
            >
                Offline
            </span>

            <span className="border-foreground/10 bg-background/60 text-foreground/70 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-lg">
                <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-amber-500 motion-safe:animate-pulse"
                />
                No connection
            </span>

            <SectionHeading
                as="h1"
                className="mt-6"
            >
                You are offline
            </SectionHeading>

            <p className="text-foreground/70 mt-5 max-w-xl text-lg leading-relaxed text-balance">
                Looks like your connection dropped. This page has not been saved
                for offline reading yet. Reconnect and try again, or head back to
                a page you have already visited.
            </p>

            <OfflineActions />
        </main>
    );
}
