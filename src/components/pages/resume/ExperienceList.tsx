import type { ExperienceEntry } from '@/components/pages/resume/types';
import ExperienceRole from '@/components/pages/resume/ExperienceRole';

/** Body for the `experience` section: every role at every company, newest first. */
export default function ExperienceList({
    entries,
}: {
    entries: ExperienceEntry[];
}) {
    return (
        <div className="flex flex-col gap-6">
            {entries.flatMap((entry) =>
                entry.positions.map((position) => (
                    <ExperienceRole
                        key={`${entry.company}-${position.role}-${position.period}`}
                        entry={entry}
                        position={position}
                    />
                ))
            )}
        </div>
    );
}
