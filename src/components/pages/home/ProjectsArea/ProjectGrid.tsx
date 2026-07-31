import SpotlightList from '@/components/pages/common/SpotlightList';
import ProjectCard from '@/components/pages/home/ProjectsArea/ProjectCard';
import { Project } from '@/components/pages/home/ProjectsArea/contents';

/**
 * A responsive project card grid. When the last row holds a single card (odd
 * count), it stays in the left column at normal column width so the row reads
 * as a continuation of the grid. `indexOffset` keeps each card's golden-angle
 * glow hue distinct across multiple grids on the page.
 *
 * The list is a SpotlightList, which owns the one delegated pointer listener that
 * drives every card's cursor spotlight; the cards themselves stay server
 * components.
 */
export default function ProjectGrid({
    projects,
    indexOffset = 0,
}: {
    projects: Project[];
    indexOffset?: number;
}) {
    return (
        <SpotlightList className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project, index) => (
                <ProjectCard
                    key={project.repoURL}
                    project={project}
                    index={indexOffset + index}
                />
            ))}
        </SpotlightList>
    );
}
