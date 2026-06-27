import ExternalLinkIcon from '@/components/icons/external-link';
import GithubIcon from '@/components/icons/github';
import Tag from '@/components/pages/common/Tag';
import ProjectLink from './ProjectLink';
import { Project } from './contents';

export default function ProjectCard({ project }: { project: Project }) {
    return (
        <li className="border-foreground/10 hover:border-foreground/30 flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg sm:p-8">
            <p className="text-foreground/60 text-base font-bold tracking-wide uppercase">
                {project.category}
            </p>
            <h3 className="mt-2 text-3xl font-bold">
                <span
                    className={`underline decoration-2 underline-offset-4 ${project.accentClassName}`}
                >
                    {project.name}
                </span>
            </h3>
            <p className="text-foreground/70 mt-4 grow text-xl leading-normal">
                {project.description}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                    <Tag
                        key={tech}
                        className="text-foreground/70 px-3 py-1 text-base"
                    >
                        {tech}
                    </Tag>
                ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
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
