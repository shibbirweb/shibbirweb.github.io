import type { AwardEntry } from '@/components/pages/resume/types';

/** One line per award: bold title, issuer, and the date on the right. */
export default function PrintAwardList({ entries }: { entries: AwardEntry[] }) {
    return (
        <div className="flex flex-col gap-0.5">
            {entries.map((entry) => (
                <div
                    key={`${entry.title}-${entry.issuer}`}
                    className="flex items-baseline justify-between gap-x-4"
                >
                    <p>
                        <span className="font-semibold text-neutral-900">
                            {entry.title}
                        </span>
                        {entry.issuer && `, ${entry.issuer}`}
                    </p>
                    <span className="shrink-0 text-neutral-500">
                        {entry.date}
                    </span>
                </div>
            ))}
        </div>
    );
}
