import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import ProjectCardMeta from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectCardMeta';
import ProjectLinks from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectLinks';
import ProjectTechLine from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectTechLine';
import styles from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectCard.module.css';
import { Project } from '@/components/pages/home/ProjectsArea/contents';
import { cn } from '@/utils/cn';
import type { CSSProperties } from 'react';

/**
 * A compact "package index" tile: a numbered mono header, the name, a
 * three-line description (the full text stays in the markup, only clipped on
 * screen), the stack as one slash-separated line, and the links in a hairline
 * footer. A thin ribbon in the card's own hue marks its left edge and runs the
 * full height on hover.
 */
export default function ProjectCard({
    project,
    index,
}: {
    project: Project;
    index: number;
}) {
    // Give every card its own multi-hue accent, generated from its position with
    // the golden angle so consecutive cards land far apart on the colour wheel.
    // Driven only by the index, so any project added to contents.ts gets a fresh,
    // distinct hue automatically. The three hues feed the ribbon and the layered
    // washes in ProjectCard.module.css; softness/theme handling live there.
    const hue = (index * 137.508) % 360;
    const glow = {
        '--glow-a': `oklch(0.72 0.16 ${hue})`,
        '--glow-b': `oklch(0.72 0.16 ${hue + 40})`,
        '--glow-c': `oklch(0.72 0.16 ${hue + 80})`,
    } as CSSProperties;

    return (
        <li
            {...spotlightSurfaceProps}
            style={glow}
            className={cn(
                styles.card,
                'group/card border-foreground/10 hover:border-foreground/25 relative isolate flex flex-col rounded-xl border p-5 transition-colors duration-300'
            )}
        >
            <span
                aria-hidden
                className={styles.ribbon}
            />

            <ProjectCardMeta
                number={index + 1}
                category={project.category}
            />
            <h4 className="mt-2 text-base leading-snug font-bold sm:text-lg">
                {project.name}
            </h4>
            <p className="text-foreground/70 mt-2 line-clamp-3 grow text-sm leading-relaxed">
                {project.description}
            </p>

            <ProjectTechLine tech={project.tech} />
            <ProjectLinks project={project} />

            <SpotlightBorder className={styles.spotlightBorder} />
        </li>
    );
}
