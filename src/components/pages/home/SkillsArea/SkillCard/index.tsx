import { cn } from '@/utils/cn';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import styles from '@/components/pages/home/SkillsArea/SkillCard/SkillCard.module.css';
import SkillIcon from '@/components/pages/home/SkillsArea/SkillIcon';
import type { FeaturedSkill } from '@/components/pages/home/SkillsArea/contents';
import type { CSSProperties } from 'react';

/**
 * A featured AI skill as a card: a brand-tinted icon badge, the skill name and
 * a one-line summary. The icon wears its brand colour at rest (or the theme
 * foreground for monochrome logos) because these cards lead the section, and a
 * soft brand-tinted glow rests dim behind the card and blooms on hover (the
 * `.card::before` in SkillCard.module.css). On top of that ambient bloom the card
 * is lit by the cursor, matching the project cards: a faint wash on ::after plus
 * a lit edge on SpotlightBorder, both centred on the pointer. Rendered as an <li>
 * inside a SpotlightList.
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
                'group border-foreground/10 hover:border-foreground/25 relative isolate flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:shadow-md sm:flex-col sm:p-6'
            )}
        >
            <span
                className={cn(
                    styles.iconBadge,
                    'border-foreground/10 flex size-11 shrink-0 items-center justify-center rounded-xl border'
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
