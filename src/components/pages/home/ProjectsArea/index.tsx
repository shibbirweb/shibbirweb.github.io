import SectionHeading from '@/components/pages/common/SectionHeading';
import MorePackageProjects from '@/components/pages/home/ProjectsArea/MorePackageProjects';
import ProjectGrid from '@/components/pages/home/ProjectsArea/ProjectGrid';
import ResumeBridge from '@/components/pages/home/ProjectsArea/ResumeBridge';
import {
    collapsedPackageProjectCount,
    packageProjects,
    personalProjects,
} from '@/components/pages/home/ProjectsArea/contents';

export default function ProjectsArea() {
    const visiblePackageProjects = packageProjects.slice(
        0,
        collapsedPackageProjectCount
    );
    const hiddenPackageProjects = packageProjects.slice(
        collapsedPackageProjectCount
    );

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

                <div className="mt-12 space-y-6">
                    <h3 className="text-foreground/70 text-center text-sm font-bold tracking-wider uppercase">
                        Packages &amp; Plugins
                    </h3>
                    <ProjectGrid projects={visiblePackageProjects} />
                    {hiddenPackageProjects.length > 0 && (
                        <MorePackageProjects>
                            <ProjectGrid
                                projects={hiddenPackageProjects}
                                indexOffset={visiblePackageProjects.length}
                            />
                        </MorePackageProjects>
                    )}
                </div>

                <div className="mt-12 space-y-6">
                    <h3 className="text-foreground/70 text-center text-sm font-bold tracking-wider uppercase">
                        Personal Projects
                    </h3>
                    <ProjectGrid
                        projects={personalProjects}
                        indexOffset={packageProjects.length}
                    />
                </div>

                <ResumeBridge />
            </div>
        </section>
    );
}
