import SectionHeading from '@/components/pages/common/SectionHeading';
import ProjectGroup from '@/components/pages/home/ProjectsArea/ProjectGroup';
import ResumeBridge from '@/components/pages/home/ProjectsArea/ResumeBridge';
import {
    collapsedPackageProjectCount,
    collapsedPersonalProjectCount,
    packageProjects,
    personalProjects,
} from '@/components/pages/home/ProjectsArea/contents';

export default function ProjectsArea() {
    return (
        <section
            id="work"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto px-4">
                <div className="flex w-full flex-col items-center space-y-3 text-center">
                    <SectionHeading>Open Source</SectionHeading>
                    <p className="text-foreground/70 max-w-xl">
                        Tools, plugins, and experiments I build in the open.
                    </p>
                </div>

                <ProjectGroup
                    title="Packages & Plugins"
                    projects={packageProjects}
                    collapsedCount={collapsedPackageProjectCount}
                    revealRegionId="more-package-projects"
                />

                <ProjectGroup
                    title="Personal Projects"
                    projects={personalProjects}
                    collapsedCount={collapsedPersonalProjectCount}
                    revealRegionId="more-personal-projects"
                    indexOffset={packageProjects.length}
                />

                <ResumeBridge />
            </div>
        </section>
    );
}
