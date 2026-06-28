import ExternalLinkIcon from '@/components/icons/external-link';
import GithubIcon from '@/components/icons/github';
import Tag from '@/components/pages/common/Tag';
import ProjectLink from '@/components/pages/home/ProjectsArea/ProjectLink';
import styles from '@/components/pages/home/ProjectsArea/ProjectCard/ProjectCard.module.css';
import { Project } from '@/components/pages/home/ProjectsArea/contents';
import { cn } from '@/utils/cn';
import type { CSSProperties } from 'react';

export default function ProjectCard({
    project,
    index,
}: {
    project: Project;
    index: number;
}) {
    // Give every card its own multi-hue corner glow, generated from its position
    // with the golden angle so consecutive cards land far apart on the colour
    // wheel. Driven only by the index, so any project added to contents.ts gets a
    // fresh, distinct gradient automatically. The three hues feed the layered
    // washes in ProjectCard.module.css; softness/theme handling live there.
    const hue = (index * 137.508) % 360;
    const glow = {
        '--glow-a': `oklch(0.72 0.16 ${hue})`,
        '--glow-b': `oklch(0.72 0.16 ${hue + 40})`,
        '--glow-c': `oklch(0.72 0.16 ${hue + 80})`,
    } as CSSProperties;

    return (
        <li
            style={glow}
            className={cn(
                styles.card,
                'border-foreground/10 hover:border-foreground/30 relative isolate flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg sm:p-8'
            )}
        >
            <p className="text-foreground/60 text-xs font-bold tracking-wide uppercase">
                {project.category}
            </p>
            <h3 className="mt-2 text-lg font-bold sm:text-xl">
                <span
                    className={`underline decoration-2 underline-offset-4 ${project.accentClassName}`}
                >
                    {project.name}
                </span>
            </h3>
            <p className="text-foreground/70 mt-3 grow text-base leading-relaxed">
                {project.description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                    <Tag
                        key={tech}
                        className="text-foreground/70 px-3 py-1 text-sm"
                    >
                        {tech}
                    </Tag>
                ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <ProjectLink
                    href={project.repoURL}
                    label="Code"
                    ariaLabel={`${project.name} source on GitHub`}
                    Icon={GithubIcon}
                />
                {project.liveURL ? (
                    <ProjectLink
                        href={project.liveURL}
                        label={project.liveLabel ?? 'Live'}
                        ariaLabel={`${project.name}, ${project.liveLabel ?? 'Live'}`}
                        Icon={ExternalLinkIcon}
                    />
                ) : null}
            </div>
        </li>
    );
}
