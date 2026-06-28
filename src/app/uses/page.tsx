import type { Metadata } from 'next';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionHeading from '@/components/pages/common/SectionHeading';
import UsesSection from '@/components/pages/uses/UsesSection';
import { usesSections } from '@/app/uses/contents';
import { siteName } from '@/config/constants';

const description = `The gear, software, developer tools, and home-lab setup ${siteName} uses day to day for software development, AI, and self-hosting.`;

export const metadata: Metadata = {
    title: 'Uses',
    description,
    alternates: { canonical: '/uses' },
    openGraph: {
        title: `Uses | ${siteName}`,
        description,
        url: '/uses',
        type: 'website',
    },
};

export default function UsesPage() {
    return (
        <main className="container mx-auto px-4 py-20 sm:py-28">
            <Breadcrumb />
            <SectionHeading as="h1">Uses</SectionHeading>
            <p className="text-foreground/70 mt-6 max-w-3xl text-lg leading-relaxed">
                The gear, software, and self-hosted setup I use day to day.
            </p>

            <div className="mt-12 flex flex-col gap-12 sm:gap-16">
                {usesSections.map((section) => (
                    <UsesSection
                        key={section.title}
                        section={section}
                    />
                ))}
            </div>
        </main>
    );
}
