import type { SkillGroup } from '@/components/pages/resume/types';
import SkillRow from '@/components/pages/resume/SkillRow';

/** Body for the `skills` section: label/value rows as a definition list. */
export default function SkillsTable({ groups }: { groups: SkillGroup[] }) {
    return (
        <dl className="flex flex-col gap-2 print:gap-1">
            {groups.map((group) => (
                <SkillRow
                    key={group.label}
                    group={group}
                />
            ))}
        </dl>
    );
}
