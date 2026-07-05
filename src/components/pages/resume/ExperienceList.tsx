import type { ExperienceEntry } from '@/components/pages/resume/types';
import ExperienceItem from '@/components/pages/resume/ExperienceItem';

/** Body for the `experience` section: a stack of roles. */
export default function ExperienceList({
    entries,
}: {
    entries: ExperienceEntry[];
}) {
    return (
        <div className="flex flex-col gap-6 print:gap-[11px]">
            {entries.map((entry) => (
                <ExperienceItem
                    key={entry.company}
                    entry={entry}
                />
            ))}
        </div>
    );
}
