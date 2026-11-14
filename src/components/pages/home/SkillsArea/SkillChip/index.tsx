import { cn } from '@/utils/cn';
import Tag from '@/components/pages/common/Tag';
import styles from '@/components/pages/home/SkillsArea/SkillChip/SkillChip.module.css';
import SkillIcon from '@/components/pages/home/SkillsArea/SkillIcon';
import type { Skill } from '@/components/pages/home/SkillsArea/contents';
import type { CSSProperties } from 'react';

/**
 * One skill as a compact pill: a small logo beside its name. The logo is muted
 * at rest so a row of chips reads as one set, then blooms to its brand colour on
 * hover (or to the theme foreground for monochrome logos) while a faint
 * brand-tinted glow fades in behind the pill (SkillChip.module.css). Built on the
 * shared Tag primitive, so it renders as an <li>.
 */
export default function SkillChip({ skill }: { skill: Skill }) {
    const { name, icon, color } = skill;

    return (
        <Tag
            style={
                color
                    ? ({ '--brand-color': color } as CSSProperties)
                    : undefined
            }
            className={cn(
                styles.chip,
                'group border-foreground/10 hover:border-foreground/25 relative isolate inline-flex items-center gap-2 py-1.5 pr-3.5 pl-2.5 text-sm duration-300'
            )}
        >
            <SkillIcon
                icon={icon}
                className={cn(
                    'text-foreground/65 size-4 transition-colors duration-300',
                    color
                        ? 'group-hover:[color:var(--brand-color)]'
                        : 'group-hover:text-foreground'
                )}
            />
            <span className="text-foreground/80 group-hover:text-foreground font-medium transition-colors duration-300">
                {name}
            </span>
        </Tag>
    );
}
