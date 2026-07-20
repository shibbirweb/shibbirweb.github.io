import SectionHeading from '@/components/pages/common/SectionHeading';
import ProjectGrid from '@/components/pages/home/ProjectsArea/ProjectGrid';
import ResumeBridge from '@/components/pages/home/ProjectsArea/ResumeBridge';
import {
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
                <div className="space-y-3 text-center">
                    <SectionHeading>Open Source</SectionHeading>
                    <p className="text-foreground/70 mx-auto max-w-xl">
                        Tools, plugins, and experiments I build in the open.
                    </p>
                </div>

                <div className="mt-12 space-y-6">
                    <h3 className="text-foreground/70 text-center text-sm font-bold tracking-wider uppercase">
                        Packages &amp; Plugins
                    </h3>
                    <ProjectGrid projects={packageProjects} />
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
