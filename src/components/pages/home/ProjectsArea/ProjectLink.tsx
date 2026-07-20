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
            className="focus-ring hover:text-foreground/60 inline-flex min-h-11 items-center gap-2 rounded-sm transition-colors"
        >
            <Icon
                className="size-5"
                aria-hidden="true"
            />
            {label}
        </a>
    );
}
