import type { ProjectEntry } from '@/components/pages/resume/types';
import OptionalExternalLink from '@/components/pages/resume/OptionalExternalLink';
import PrintBulletList from '@/components/pages/resume/ResumePrint/PrintBulletList';
import PrintEntryHeading from '@/components/pages/resume/ResumePrint/PrintEntryHeading';
import PrintTechLine from '@/components/pages/resume/ResumePrint/PrintTechLine';

/** "Name, tagline" with the company on the right, then highlights and stack. */
export default function PrintProjectItem({ entry }: { entry: ProjectEntry }) {
    return (
        <div className="break-inside-avoid">
            <PrintEntryHeading
                title={
                    <>
                        <OptionalExternalLink
                            href={entry.url}
                            className="font-bold text-neutral-900"
                        >
                            {entry.name}
                        </OptionalExternalLink>
                        {entry.tagline && (
                            <span className="font-normal">
                                , {entry.tagline}
                            </span>
                        )}
                    </>
                }
                meta={entry.company}
            />
            {entry.highlights && entry.highlights.length > 0 && (
                <PrintBulletList
                    items={entry.highlights}
                    className="mt-0.5"
                />
            )}
            {entry.tech && entry.tech.length > 0 && (
                <PrintTechLine tech={entry.tech} />
            )}
        </div>
    );
}
