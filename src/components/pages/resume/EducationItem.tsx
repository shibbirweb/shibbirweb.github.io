import type { EducationEntry } from '@/components/pages/resume/types';
import MetaText from '@/components/pages/resume/MetaText';

/** One institution: name + year, degree underneath. */
export default function EducationItem({
    entry,
}: {
    entry: EducationEntry;
}) {
    return (
        <div className="print:break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="font-semibold">
                    {entry.institutionURL ? (
                        <a
                            href={entry.institutionURL}
                            className="hover:underline"
                        >
                            {entry.institution}
                        </a>
                    ) : (
                        entry.institution
                    )}
                </h3>
                <MetaText>{entry.year}</MetaText>
            </div>
            <p className="text-foreground/90 font-medium">{entry.degree}</p>
        </div>
    );
}
