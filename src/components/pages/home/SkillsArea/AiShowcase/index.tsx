import { cn } from '@/utils/cn';
import SpotlightList from '@/components/pages/common/SpotlightList';
import styles from '@/components/pages/home/SkillsArea/AiShowcase/AiShowcase.module.css';
import SkillCard from '@/components/pages/home/SkillsArea/SkillCard';
import SkillChipList from '@/components/pages/home/SkillsArea/SkillChipList';
import {
    aiShowcaseBadge,
    aiShowcaseTitle,
    aiToolkit,
    aiToolkitTitle,
    featuredAiSkills,
} from '@/components/pages/home/SkillsArea/contents';

/**
 * The AI half of the skills panel, which the section leads with: the headline
 * AI skills as open columns, then the rest of the AI toolkit as chips. It has
 * no surface of its own; SkillsPanel draws the one box around both halves.
 */
export default function AiShowcase() {
    return (
        <div>
            <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold sm:text-2xl">
                    {aiShowcaseTitle}
                </h3>
                <span
                    className={cn(
                        styles.focusBadge,
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold'
                    )}
                >
                    {aiShowcaseBadge}
                </span>
            </div>

            <SpotlightList className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featuredAiSkills.map((skill) => (
                    <SkillCard
                        key={skill.name}
                        skill={skill}
                    />
                ))}
            </SpotlightList>

            <h4
                id="ai-toolkit-heading"
                className="text-foreground/60 mt-8 text-xs font-bold tracking-wider uppercase"
            >
                {aiToolkitTitle}
            </h4>
            <SkillChipList
                skills={aiToolkit}
                labelledBy="ai-toolkit-heading"
                className="mt-3"
            />
        </div>
    );
}
