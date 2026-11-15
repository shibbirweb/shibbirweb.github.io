import styles from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectTechLine/ProjectTechLine.module.css';
import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';
import type { CSSProperties } from 'react';

/**
 * The project's stack as slanted mono tags. They rest neutral and, when the
 * card (the `group/card` around them) is hovered, take on the card's own hue
 * one after another, left to right; each tag's position feeds the stagger.
 * Hovering a single tag blooms the card-hue glow around and inside it. The
 * slanted face is an inner span so the glow on the <li> is not clipped away.
 */
export default function ProjectTechLine({ tech }: { tech: string[] }) {
    return (
        <ul
            aria-label="Tech stack"
            className={cn(
                monoTextClassName,
                'mt-3 flex flex-wrap gap-x-1 gap-y-1.5 text-[11px]'
            )}
        >
            {tech.map((item, index) => (
                <li
                    key={item}
                    style={{ '--token-index': index } as CSSProperties}
                    className={cn(
                        styles.token,
                        'text-foreground/80 group-hover/card:text-foreground group-hover/card:[--token-tint:16%]'
                    )}
                >
                    <span className={styles.tokenFace}>{item}</span>
                </li>
            ))}
        </ul>
    );
}
