import type {
    ExperienceEntry,
    ExperiencePosition,
} from '@/components/pages/resume/types';
import BulletList from '@/components/pages/resume/BulletList';
import { experienceSubline } from '@/components/pages/resume/experienceSubline';
import MetaText from '@/components/pages/resume/MetaText';
import OptionalExternalLink from '@/components/pages/resume/OptionalExternalLink';
import TechLine from '@/components/pages/resume/TechLine';

/**
 * One role as "Role, Company" with its dates, then the location and promotion
 * line, the highlights and the optional technology chips. Mirrors the printed
 * `PrintExperienceRole`, so the page and the PDF read the same.
 */
export default function ExperienceRole({
    entry,
    position,
}: {
    entry: ExperienceEntry;
    position: ExperiencePosition;
}) {
    const subline = experienceSubline(entry, position);

    return (
        <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-[15px] font-bold">
                    {position.role},{' '}
                    <OptionalExternalLink
                        href={entry.companyURL}
                        className="text-foreground/80 font-semibold hover:underline"
                    >
                        {entry.company}
                    </OptionalExternalLink>
                </h3>
                <MetaText>{position.period}</MetaText>
            </div>
            {subline && <MetaText className="mt-1 block">{subline}</MetaText>}

            {position.highlights && position.highlights.length > 0 && (
                <BulletList
                    items={position.highlights}
                    className="mt-2"
                />
            )}

            {position.tech && position.tech.length > 0 && (
                <TechLine tech={position.tech} />
            )}
        </div>
    );
}
