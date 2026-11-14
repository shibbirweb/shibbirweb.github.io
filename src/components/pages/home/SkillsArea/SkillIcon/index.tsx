import { cn } from '@/utils/cn';
import styles from '@/components/pages/home/SkillsArea/SkillIcon/SkillIcon.module.css';
import { skillIconUrl } from '@/components/pages/home/SkillsArea/contents';
import type { CSSProperties } from 'react';

/**
 * A skill logo, drawn as a CSS mask over `currentColor` so the colour classes
 * on it (muted at rest, brand colour on hover) still apply. The logo file is
 * named in a custom property only; SkillIcon.module.css switches the mask on
 * once SkillIconsRegion reports the section is near the viewport, so the logo
 * files stay out of the page's start-up and out of its HTML. Decorative: the
 * skill name beside it is the text that counts.
 */
export default function SkillIcon({
    icon,
    className,
}: {
    icon: string;
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            data-skill-icon={icon}
            style={
                {
                    '--skill-icon-url': `url(${skillIconUrl(icon)})`,
                } as CSSProperties
            }
            className={cn(styles.icon, className)}
        />
    );
}
