import type { Metadata } from 'next';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionHeading from '@/components/pages/common/SectionHeading';
import NowSection from '@/components/pages/now/NowSection';
import { nowMeta, nowQuote, nowSections } from '@/app/now/contents';
import { siteName } from '@/config/constants';

const description = `What ${siteName} is focused on right now: current work, what he's building and learning, home-lab experiments, reading, and goals.`;

export const metadata: Metadata = {
    title: 'Now',
    description,
    alternates: { canonical: '/now' },
    openGraph: {
        title: `Now | ${siteName}`,
        description,
        url: '/now',
        type: 'website',
    },
};

export default function NowPage() {
    return (
        <main className="container mx-auto px-4 py-20 sm:py-28">
            <Breadcrumb />
            <SectionHeading as="h1">{nowMeta.title}</SectionHeading>
            <p className="text-foreground/70 mt-6 max-w-3xl text-lg leading-relaxed">
                {nowMeta.subtitle}
            </p>
            <p className="text-foreground/60 mt-4 text-sm">
                Last updated{' '}
                <time className="text-foreground/80 font-semibold">
                    {nowMeta.lastUpdated}
                </time>
            </p>

            <div className="mt-12 flex flex-col gap-12 sm:gap-16">
                {nowSections.map((section) => (
                    <NowSection
                        key={section.title}
                        section={section}
                    />
                ))}
            </div>

            <blockquote className="text-foreground/80 mt-16 border-l-4 border-emerald-500 pl-6 text-xl font-semibold italic">
                {nowQuote}
            </blockquote>
        </main>
    );
}
