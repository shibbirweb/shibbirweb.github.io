import type { SkillGroup } from '@/components/pages/resume/types';

/** One skills row: group label (fixed column) + comma-joined values. */
export default function SkillRow({ group }: { group: SkillGroup }) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 font-semibold">{group.label}</dt>
            <dd className="text-foreground/70">{group.values.join(', ')}</dd>
        </div>
    );
}
