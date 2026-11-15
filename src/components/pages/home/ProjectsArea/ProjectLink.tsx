interface ProjectLinkProps {
    href: string;
    label: string;
    ariaLabel: string;
    Icon: React.ElementType;
}

export default function ProjectLink({
    href,
    label,
    ariaLabel,
    Icon,
}: ProjectLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className="focus-ring text-foreground/75 hover:text-foreground inline-flex min-h-8 items-center gap-1.5 rounded-sm transition-colors"
        >
            <Icon
                className="size-3.5"
                aria-hidden="true"
            />
            {label}
        </a>
    );
}
