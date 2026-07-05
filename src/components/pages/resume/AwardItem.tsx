import type { AwardEntry } from '@/components/pages/resume/types';
import MetaText from '@/components/pages/resume/MetaText';

/** One award: title + date, issuer underneath. */
export default function AwardItem({ entry }: { entry: AwardEntry }) {
    return (
        <div className="print:break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="font-semibold">{entry.title}</h3>
                <MetaText>{entry.date}</MetaText>
            </div>
            {entry.issuer && (
                <p className="text-foreground/70">{entry.issuer}</p>
            )}
        </div>
    );
}
