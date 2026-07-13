import Breadcrumb from '@/components/layout/Breadcrumb';
import Masthead from '@/components/pages/uses/Masthead';
import ContentsIndex from '@/components/pages/uses/ContentsIndex';
import GearGuideEntry from '@/components/pages/uses/GearGuideEntry';
import { entryNumber, sectionId } from '@/components/pages/uses/meta';
import { usesSections } from '@/app/uses/contents';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description = `The gear, editor setup, extensions, dotfiles, and self-hosted home lab ${siteName} uses day to day for software development, AI, and self-hosting.`;

export const metadata = buildPageMetadata({
    title: 'Uses',
    description,
    path: '/uses',
});

const entries = usesSections.map((section, index) => ({
    section,
    id: sectionId(section.title),
    number: entryNumber(index),
}));

export default function UsesPage() {
    return (
        <main className="mx-auto max-w-5xl px-4 py-20 sm:py-24">
            <Breadcrumb />

            <div className="mt-6">
                <Masthead />
            </div>

            <ContentsIndex
                entries={entries.map((entry) => ({
                    id: entry.id,
                    number: entry.number,
                    title: entry.section.title,
                    group: entry.section.group,
                }))}
            />

            <div className="mt-16 flex flex-col gap-14 sm:gap-20">
                {entries.map((entry) => (
                    <GearGuideEntry
                        key={entry.id}
                        section={entry.section}
                        id={entry.id}
                        number={entry.number}
                    />
                ))}
            </div>
        </main>
    );
}
