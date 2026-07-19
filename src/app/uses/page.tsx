import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionHeading from '@/components/pages/common/SectionHeading';
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
        <main className="container mx-auto px-4 py-20 sm:py-28">
            <Breadcrumb />
            <SectionHeading as="h1">Uses</SectionHeading>
            <p className="text-foreground/70 mt-6 max-w-3xl text-lg leading-relaxed">
                A field guide to my setup: the gear on my desk, the machines that
                run quietly in the rack, and the software I reach for every day.
            </p>

            <div className="mt-12">
                <UsesGrid sections={usesSections} />
            </div>
        </main>
    );
}
