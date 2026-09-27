import MoreProjects from '@/components/pages/home/ProjectsArea/MoreProjects';
import ProjectGrid from '@/components/pages/home/ProjectsArea/ProjectGrid';
import { Project } from '@/components/pages/home/ProjectsArea/contents';

/**
 * One titled group of project cards (e.g. "Personal Projects"). The first
 * `collapsedCount` cards always show; the rest wait behind a "Show more"
 * toggle, which is left out entirely when every card already fits.
 * `indexOffset` is passed on so card glow hues stay distinct across groups.
 */
export default function ProjectGroup({
    title,
    projects,
    collapsedCount,
    revealRegionId,
    indexOffset = 0,
}: {
    title: string;
    projects: Project[];
    collapsedCount: number;
    revealRegionId: string;
    indexOffset?: number;
}) {
    const visibleProjects = projects.slice(0, collapsedCount);
    const hiddenProjects = projects.slice(collapsedCount);

    return (
        <div className="mt-12 space-y-6">
            <h3 className="text-foreground/70 text-center text-sm font-bold tracking-wider uppercase">
                {title}
            </h3>
            <ProjectGrid
                projects={visibleProjects}
                indexOffset={indexOffset}
            />
            {hiddenProjects.length > 0 && (
                <MoreProjects revealRegionId={revealRegionId}>
                    <ProjectGrid
                        projects={hiddenProjects}
                        indexOffset={indexOffset + visibleProjects.length}
                    />
                </MoreProjects>
            )}
        </div>
    );
}
