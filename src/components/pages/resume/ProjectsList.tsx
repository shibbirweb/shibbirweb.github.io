import type { ProjectEntry } from '@/components/pages/resume/types';
import ProjectItem from '@/components/pages/resume/ProjectItem';

/** Body for the `projects` section: a stack of projects. */
export default function ProjectsList({
    entries,
}: {
    entries: ProjectEntry[];
}) {
    return (
        <div className="flex flex-col gap-5 print:gap-[11px]">
            {entries.map((entry) => (
                <ProjectItem
                    key={entry.name}
                    entry={entry}
                />
            ))}
        </div>
    );
}
