import StackGroup from '@/components/pages/home/SkillsArea/StackGroup';
import {
    stackGroups,
    stackOverviewTitle,
} from '@/components/pages/home/SkillsArea/contents';

/**
 * The full-stack half of the skills panel, under the "Built on" divider: one
 * labelled row of chips per layer.
 */
export default function StackOverview() {
    return (
        <div>
            <h3 className="text-xl font-bold sm:text-2xl">
                {stackOverviewTitle}
            </h3>
            <ul className="mt-6 space-y-5 sm:space-y-4">
                {stackGroups.map((group) => (
                    <StackGroup
                        key={group.title}
                        group={group}
                    />
                ))}
            </ul>
        </div>
    );
}
