import type { EducationEntry } from '@/components/pages/resume/types';
import EducationItem from '@/components/pages/resume/EducationItem';

/** Body for the `education` section: a stack of institutions. */
export default function EducationList({
    entries,
}: {
    entries: EducationEntry[];
}) {
    return (
        <div className="flex flex-col gap-4 print:gap-2">
            {entries.map((entry) => (
                <EducationItem
                    key={`${entry.institution}-${entry.degree}`}
                    entry={entry}
                />
            ))}
        </div>
    );
}
