import ExternalLinkIcon from '@/components/icons/external-link';
import GithubIcon from '@/components/icons/github';
import ProjectLink from '@/components/pages/home/ProjectsArea/ProjectLink';
import { Project } from '@/components/pages/home/ProjectsArea/contents';
import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';

/**
 * The tile's footer: the source repo first, then every distribution or docs
 * link, as compact mono links under a hairline.
 */
export default function ProjectLinks({ project }: { project: Project }) {
    return (
        <div
            className={cn(
                monoTextClassName,
                'border-foreground/10 mt-4 flex flex-wrap items-center gap-x-4 border-t pt-2 text-xs'
            )}
        >
            <ProjectLink
                href={project.repoURL}
                label="Code"
                ariaLabel={`${project.name} source on GitHub`}
                Icon={GithubIcon}
            />
            {project.links?.map((link) => (
                <ProjectLink
                    key={link.url}
                    href={link.url}
                    label={link.label}
                    ariaLabel={`${project.name}, ${link.label}`}
                    Icon={ExternalLinkIcon}
                />
            ))}
        </div>
    );
}
