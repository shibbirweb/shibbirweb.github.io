import { cn } from '@/utils/cn';
import SkillChip from '@/components/pages/home/SkillsArea/SkillChip';
import type { Skill } from '@/components/pages/home/SkillsArea/contents';

/** A wrapping row of skill chips, used by the AI toolkit and each stack row. */
export default function SkillChipList({
    skills,
    className,
    labelledBy,
}: {
    skills: Skill[];
    className?: string;
    /** Id of the heading that names this list. */
    labelledBy?: string;
}) {
    return (
        <ul
            aria-labelledby={labelledBy}
            className={cn('flex flex-wrap gap-2', className)}
        >
            {skills.map((skill) => (
                <SkillChip
                    key={skill.name}
                    skill={skill}
                />
            ))}
        </ul>
    );
}
