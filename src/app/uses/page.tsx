import PageTopBar from '@/components/pages/common/PageTopBar';
import UsesGrid from '@/components/pages/uses/UsesGrid';
import { usesSections } from '@/app/uses/contents';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description = `The gear, software, developer tools, and home-lab setup ${siteName} uses day to day for software development, AI, and self-hosting.`;

export const metadata = buildPageMetadata({
    title: 'Uses',
    description,
    path: '/uses',
});

export default function UsesPage() {
    return (
        <main
            id="main"
            className="container mx-auto px-4 py-20 sm:py-28"
        >
            <PageTopBar
                title="Uses"
                description="A field guide to my setup: the gear on my desk, the machines that run quietly in the rack, and the software I reach for every day."
            />

            <div className="mt-8">
                <UsesGrid sections={usesSections} />
            </div>
        </main>
    );
}
