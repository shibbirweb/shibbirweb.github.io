import type { EducationEntry } from '@/components/pages/resume/types';

/** One line per qualification: degree, institution, year. */
export default function PrintEducationList({
    entries,
}: {
    entries: EducationEntry[];
}) {
    return (
        <div className="flex flex-col gap-0.5">
            {entries.map((entry) => (
                <p key={`${entry.institution}-${entry.degree}`}>
                    {entry.degree}, {entry.institution}, {entry.year}
                </p>
            ))}
        </div>
    );
}
