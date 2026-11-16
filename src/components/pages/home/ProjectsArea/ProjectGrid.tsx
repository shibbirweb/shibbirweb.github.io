import SpotlightList from '@/components/pages/common/SpotlightList';
import ProjectCard from '@/components/pages/home/ProjectsArea/ProjectCard';
import { Project } from '@/components/pages/home/ProjectsArea/contents';

/**
 * A responsive project tile grid: one column on phones, two on tablets, three
 * on wide screens. A short last row stays left-aligned at normal column width
 * so it reads as a continuation of the grid. `indexOffset` keeps each card's golden-angle
 * glow hue distinct across multiple grids on the page, while `numberOffset`
 * carries the shown card number on within one group (e.g. behind Show more).
 *
 * The list is a SpotlightList, which owns the one delegated pointer listener that
 * drives every card's cursor spotlight; the cards themselves stay server
 * components.
 */
export default function ProjectGrid({
    projects,
    indexOffset = 0,
    numberOffset = 0,
}: {
    projects: Project[];
    indexOffset?: number;
    numberOffset?: number;
}) {
    return (
        <SpotlightList className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
                <ProjectCard
                    key={project.repoURL}
                    project={project}
                    index={indexOffset + index}
                    number={numberOffset + index + 1}
                />
            ))}
        </SpotlightList>
    );
}
