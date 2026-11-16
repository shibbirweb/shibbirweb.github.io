import type { ProjectEntry } from '@/components/pages/resume/types';
import PrintBulletList from '@/components/pages/resume/ResumePrint/PrintBulletList';
import PrintCompactProject from '@/components/pages/resume/ResumePrint/PrintCompactProject';
import PrintProjectItem from '@/components/pages/resume/ResumePrint/PrintProjectItem';

/**
 * Printed projects. `compact` renders one bullet per project (name, stack and
 * a one-line description, like an open source list); the default renders each
 * project as a full entry with its own highlights.
 */
export default function PrintProjectList({
    entries,
    layout,
}: {
    entries: ProjectEntry[];
    layout?: 'detailed' | 'compact';
}) {
    if (layout === 'compact') {
        return (
            <PrintBulletList
                items={entries.map((entry) => (
                    <PrintCompactProject
                        key={entry.name}
                        entry={entry}
                    />
                ))}
            />
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {entries.map((entry) => (
                <PrintProjectItem
                    key={entry.name}
                    entry={entry}
                />
            ))}
        </div>
    );
}
