import type {
    ExperienceEntry,
    ExperiencePosition,
} from '@/components/pages/resume/types';
import { experienceSubline } from '@/components/pages/resume/experienceSubline';
import OptionalExternalLink from '@/components/pages/resume/OptionalExternalLink';
import PrintBulletList from '@/components/pages/resume/ResumePrint/PrintBulletList';
import PrintEntryHeading from '@/components/pages/resume/ResumePrint/PrintEntryHeading';
import PrintTechLine from '@/components/pages/resume/ResumePrint/PrintTechLine';

/** "Role, Company" with dates, a grey context line, highlights and stack. */
export default function PrintExperienceRole({
    entry,
    position,
}: {
    entry: ExperienceEntry;
    position: ExperiencePosition;
}) {
    const subline = experienceSubline(entry, position);

    return (
        <div className="break-inside-avoid">
            <PrintEntryHeading
                title={
                    <>
                        <span className="font-bold">{position.role}</span>,{' '}
                        <OptionalExternalLink
                            href={entry.companyURL}
                            className="font-normal text-neutral-900"
                        >
                            {entry.company}
                        </OptionalExternalLink>
                    </>
                }
                meta={position.period}
            />
            {subline && <p className="text-neutral-500">{subline}</p>}
            {position.highlights && position.highlights.length > 0 && (
                <PrintBulletList
                    items={position.highlights}
                    className="mt-0.5"
                />
            )}
            {position.tech && position.tech.length > 0 && (
                <PrintTechLine tech={position.tech} />
            )}
        </div>
    );
}
