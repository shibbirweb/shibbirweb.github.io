import ProjectCard from '@/components/pages/home/ProjectsArea/ProjectCard';
import { Project } from '@/components/pages/home/ProjectsArea/contents';

/**
 * A responsive project card grid. When the last row holds a single card (odd
 * count), that card spans both columns but keeps a single-column width and
 * centers, so it never sits lonely against the left edge. `indexOffset` keeps
 * each card's golden-angle glow hue distinct across multiple grids on the page.
 */
export default function ProjectGrid({
    projects,
    indexOffset = 0,
}: {
    projects: Project[];
    indexOffset?: number;
}) {
    return (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:[&>li:last-child:nth-child(odd)]:col-span-2 md:[&>li:last-child:nth-child(odd)]:mx-auto md:[&>li:last-child:nth-child(odd)]:w-[calc(50%-0.75rem)]">
            {projects.map((project, index) => (
                <ProjectCard
                    key={project.repoURL}
                    project={project}
                    index={indexOffset + index}
                />
            ))}
        </ul>
    );
}
