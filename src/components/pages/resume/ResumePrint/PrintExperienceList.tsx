import type { ExperienceEntry } from '@/components/pages/resume/types';
import PrintExperienceRole from '@/components/pages/resume/ResumePrint/PrintExperienceRole';

/** Every role at every company, one block per role, most recent first. */
export default function PrintExperienceList({
    entries,
}: {
    entries: ExperienceEntry[];
}) {
    return (
        <div className="flex flex-col gap-1.5">
            {entries.flatMap((entry) =>
                entry.positions.map((position) => (
                    <PrintExperienceRole
                        key={`${entry.company}-${position.role}-${position.period}`}
                        entry={entry}
                        position={position}
                    />
                ))
            )}
        </div>
    );
}
