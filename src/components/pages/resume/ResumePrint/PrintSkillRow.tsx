import type { SkillGroup } from '@/components/pages/resume/types';

/** One skills row; `contents` lets both cells sit in the parent grid. */
export default function PrintSkillRow({ group }: { group: SkillGroup }) {
    return (
        <div className="contents">
            <dt className="font-semibold text-neutral-900">{group.label}</dt>
            <dd>{group.values.join(', ')}</dd>
        </div>
    );
}
