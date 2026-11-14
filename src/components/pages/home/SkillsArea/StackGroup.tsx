import SkillChipList from '@/components/pages/home/SkillsArea/SkillChipList';
import type { SkillGroup } from '@/components/pages/home/SkillsArea/contents';

/**
 * One labelled row of the supporting stack (e.g. "Frontend"): the label sits
 * above its chips on small screens and in a fixed left column from `sm` up, so
 * every row's chips start on the same line.
 */
export default function StackGroup({ group }: { group: SkillGroup }) {
    const headingId = `stack-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return (
        <li className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <h4
                id={headingId}
                className="text-foreground/60 text-xs font-bold tracking-wider uppercase sm:pt-2.5"
            >
                {group.title}
            </h4>
            <SkillChipList
                skills={group.skills}
                labelledBy={headingId}
            />
        </li>
    );
}
