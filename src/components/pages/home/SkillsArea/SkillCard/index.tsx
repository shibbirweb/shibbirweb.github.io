import { cn } from '@/utils/cn';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import styles from '@/components/pages/home/SkillsArea/SkillCard/SkillCard.module.css';
import SkillIcon from '@/components/pages/home/SkillsArea/SkillIcon';
import type { FeaturedSkill } from '@/components/pages/home/SkillsArea/contents';
import type { CSSProperties } from 'react';

/**
 * A featured AI skill as a bordered card: a brand-tinted icon tile, the skill
 * name and a one-line summary. Its hover matches the project cards: the border
 * brightens, a soft brand-tinted glow rests dim and blooms (`.card::before`), a
 * faint wash follows the cursor (`.card::after`), and a brand-coloured arc
 * lights the stretch of border nearest the pointer (SpotlightBorder), all in
 * SkillCard.module.css. The icon wears its brand colour at rest (or the theme
 * foreground for monochrome logos) because these cards lead the section.
 * Rendered as an <li> inside a SpotlightList.
 */
export default function SkillCard({ skill }: { skill: FeaturedSkill }) {
    const { name, icon, color, summary } = skill;

    return (
        <li
            {...spotlightSurfaceProps}
            style={
                color
                    ? ({ '--brand-color': color } as CSSProperties)
                    : undefined
            }
            className={cn(
                styles.card,
                'border-foreground/10 hover:border-foreground/30 relative isolate flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg sm:flex-col sm:p-6'
            )}
        >
            <span
                className={cn(
                    styles.iconBadge,
                    'flex size-11 shrink-0 items-center justify-center rounded-xl'
                )}
            >
                <SkillIcon
                    icon={icon}
                    className="size-6 [color:var(--brand-color,var(--foreground))]"
                />
            </span>
            <div className="space-y-2 sm:space-y-3">
                <h4 className="text-base font-bold sm:mt-1 sm:text-lg">
                    {name}
                </h4>
                <p className="text-foreground/70 text-sm leading-relaxed">
                    {summary}
                </p>
            </div>

            <SpotlightBorder className={styles.spotlightBorder} />
        </li>
    );
}
