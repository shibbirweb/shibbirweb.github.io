import PageTopBar from '@/components/pages/common/PageTopBar';
import LastUpdatedBadge from '@/components/pages/now/LastUpdatedBadge';
import NowGrid from '@/components/pages/now/NowGrid';
import { nowMeta, nowQuote, nowSections } from '@/app/now/contents';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description = `What ${siteName} is focused on right now: current work, what he's building and learning, home-lab experiments, reading, and goals.`;

export const metadata = buildPageMetadata({
    title: 'Now',
    description,
    path: '/now',
});

export default function NowPage() {
    return (
        <main
            id="main"
            className="container mx-auto px-4 py-20 sm:py-28"
        >
            <PageTopBar
                title={nowMeta.title}
                description={nowMeta.subtitle}
                action={<LastUpdatedBadge label={nowMeta.lastUpdated} />}
            />

            <div className="mt-8">
                <NowGrid sections={nowSections} />
            </div>

            <blockquote className="text-foreground/80 mt-16 border-l-4 border-emerald-500 pl-6 text-xl font-semibold italic">
                {nowQuote}
            </blockquote>
        </main>
    );
}
