import type { SkillGroup } from '@/components/pages/resume/types';
import PrintSkillRow from '@/components/pages/resume/ResumePrint/PrintSkillRow';

/** Two-column skills table: bold group label, then comma-joined values. */
export default function PrintSkillsTable({ groups }: { groups: SkillGroup[] }) {
    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-0.5">
            {groups.map((group) => (
                <PrintSkillRow
                    key={group.label}
                    group={group}
                />
            ))}
        </dl>
    );
}
