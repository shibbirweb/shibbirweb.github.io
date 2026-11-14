import { cn } from '@/utils/cn';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import Tag from '@/components/pages/common/Tag';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import styles from '@/components/pages/home/SkillsArea/SkillChip/SkillChip.module.css';
import SkillIcon from '@/components/pages/home/SkillsArea/SkillIcon';
import type { Skill } from '@/components/pages/home/SkillsArea/contents';
import type { CSSProperties } from 'react';

/**
 * One skill as a compact pill: a small logo beside its name, on a soft fill
 * with no visible outline at rest (the shared Tag's border is transparent). On
 * hover it gets the same glow as the cards: the border fades in, a
 * brand-tinted glow blooms behind the pill, a faint wash follows the cursor,
 * and a brand-coloured arc lights the stretch of border nearest the pointer
 * (SpotlightBorder), all in SkillChip.module.css. The logo is muted at rest so
 * a row of chips reads as one set, then turns its brand colour (or the theme
 * foreground for monochrome logos). Built on the shared Tag primitive, so it
 * renders as an <li> inside a SpotlightList.
 */
export default function SkillChip({ skill }: { skill: Skill }) {
    const { name, icon, color } = skill;

    return (
        <Tag
            {...spotlightSurfaceProps}
            style={
                color
                    ? ({ '--brand-color': color } as CSSProperties)
                    : undefined
            }
            className={cn(
                styles.chip,
                'group bg-foreground/[0.05] hover:bg-foreground/[0.08] hover:border-foreground/25 relative isolate inline-flex cursor-pointer items-center gap-2 border-transparent py-1.5 pr-3.5 pl-2.5 text-sm duration-300'
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

            <SpotlightBorder className={styles.spotlightBorder} />
        </Tag>
    );
}
