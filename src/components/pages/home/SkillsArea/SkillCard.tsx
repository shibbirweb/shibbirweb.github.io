import { cn } from '@/utils/cn';
import type { Skill } from '@/components/pages/home/SkillsArea/contents';
import type { CSSProperties } from 'react';

/**
 * A single skill rendered as a square tile: icon stacked above its name. The
 * icon is muted at rest so the grid reads as one cohesive set, then blooms to
 * its brand colour on hover (or to the theme foreground for monochrome brand
 * logos). Fixed width so the tiles stay compact and the flex-wrap row (and the
 * orphan last row) can centre. Rendered as an <li> inside the <ul>.
 */
export default function SkillCard({ skill }: { skill: Skill }) {
    const { name, Icon, color } = skill;

    return (
        <li
            style={
                color
                    ? ({ '--brand-color': color } as CSSProperties)
                    : undefined
            }
            className="group border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.03] flex aspect-square w-24 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border p-2 text-center transition-all duration-300 hover:shadow-sm motion-safe:hover:-translate-y-0.5 sm:w-28 lg:w-32"
        >
            <Icon
                className={cn(
                    'text-foreground/45 size-7 shrink-0 transition-colors duration-300',
                    color
                        ? 'group-hover:[color:var(--brand-color)]'
                        : 'group-hover:text-foreground'
                )}
            />
            <span className="text-foreground/75 group-hover:text-foreground text-xs leading-tight font-medium transition-colors duration-300">
                {name}
            </span>
        </li>
    );
}
