import type { AwardEntry } from '@/components/pages/resume/types';
import AwardItem from '@/components/pages/resume/AwardItem';

/** Body for the `awards` section: a stack of honors and awards. */
export default function AwardsList({ entries }: { entries: AwardEntry[] }) {
    return (
        <div className="flex flex-col gap-3 print:gap-2">
            {entries.map((entry) => (
                <AwardItem
                    key={`${entry.title}-${entry.date}`}
                    entry={entry}
                />
            ))}
        </div>
    );
}
