import StackGroup from '@/components/pages/home/SkillsArea/StackGroup';
import {
    stackGroups,
    stackOverviewTitle,
} from '@/components/pages/home/SkillsArea/contents';

/** The supporting stack under the AI panel, one labelled row per layer. */
export default function StackOverview() {
    return (
        <div className="mt-12 sm:px-8 lg:px-10">
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
