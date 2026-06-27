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
            className="hover:text-foreground/60 inline-flex items-center gap-2 transition-colors"
        >
            <Icon
                className="size-5"
                aria-hidden="true"
            />
            {label}
        </a>
    );
}
