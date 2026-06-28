import SectionHeading from '@/components/pages/common/SectionHeading';
import ProjectCard from '@/components/pages/home/ProjectsArea/ProjectCard';
import { projects } from '@/components/pages/home/ProjectsArea/contents';

export default function ProjectsArea() {
    return (
        <section
            id="work"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto px-4">
                <SectionHeading accentClassName="decoration-blue-500">
                    Featured Projects
                </SectionHeading>

                <p className="text-foreground/70 mt-6 max-w-3xl text-2xl leading-normal">
                    A few things I&apos;ve built.
                </p>

                <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.repoURL}
                            project={project}
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
}
