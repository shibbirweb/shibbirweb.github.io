import { cn } from '@/utils/cn';

/**
 * A single line-icon component parameterized by name. The Studio needs a wide
 * icon vocabulary (toolbar, slash menu, actions); collecting them in one
 * name-keyed map keeps that set in a single place while matching the repo's
 * stroke style (currentColor, 24x24, round caps).
 */
export type IconName =
    | 'plus'
    | 'search'
    | 'filter'
    | 'sort'
    | 'more'
    | 'trash'
    | 'pencil'
    | 'eye'
    | 'copy'
    | 'publish'
    | 'unpublish'
    | 'file'
    | 'image'
    | 'code'
    | 'table'
    | 'quote'
    | 'list'
    | 'list-ordered'
    | 'checklist'
    | 'divider'
    | 'diagram'
    | 'github'
    | 'bold'
    | 'italic'
    | 'strike'
    | 'underline'
    | 'link'
    | 'heading'
    | 'highlight'
    | 'inline-code'
    | 'chevron-down'
    | 'chevron-right'
    | 'close'
    | 'check'
    | 'arrow-left'
    | 'split'
    | 'maximize'
    | 'minimize'
    | 'sun'
    | 'moon'
    | 'monitor'
    | 'tablet'
    | 'phone'
    | 'calendar'
    | 'tag'
    | 'layers'
    | 'settings'
    | 'callout'
    | 'info'
    | 'star'
    | 'save'
    | 'sparkles'
    | 'details'
    | 'external';

const PATHS: Record<IconName, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </>
    ),
    filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
    sort: <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 4v16" />,
    more: (
        <>
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
        </>
    ),
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />,
    pencil: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />,
    eye: (
        <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    copy: (
        <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </>
    ),
    publish: <path d="M12 19V5M5 12l7-7 7 7" />,
    unpublish: <path d="M12 5v14M19 12l-7 7-7-7" />,
    file: (
        <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </>
    ),
    image: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </>
    ),
    code: <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
    table: <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />,
    quote: <path d="M3 21c3 0 7-1 7-8V5H3v7h4M14 21c3 0 7-1 7-8V5h-7v7h4" />,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    'list-ordered': <path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4l2-2.5V14H4" />,
    checklist: <path d="m3 7 2 2 3-3M3 17l2 2 3-3M13 6h8M13 12h8M13 18h8" />,
    divider: <path d="M3 12h18" />,
    diagram: (
        <>
            <rect x="5" y="3" width="14" height="5" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
            <rect x="14" y="16" width="7" height="5" rx="1" />
            <path d="M12 8v4M12 12H6.5v4M12 12h5.5v4" />
        </>
    ),
    github: (
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    ),
    bold: <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />,
    italic: <path d="M19 4h-9M14 20H5M15 4 9 20" />,
    strike: <path d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6M4 12h16" />,
    underline: <path d="M6 4v6a6 6 0 0 0 12 0V4M4 21h16" />,
    link: <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
    heading: <path d="M6 4v16M18 4v16M6 12h12" />,
    highlight: <path d="m9 11-6 6v3h3l6-6M16 5l3 3M14 7l4 4-7 7H7v-4z" />,
    'inline-code': <path d="m10 9-3 3 3 3M14 9l3 3-3 3" />,
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    'chevron-right': <path d="m9 6 6 6-6 6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    check: <path d="M20 6 9 17l-5-5" />,
    'arrow-left': <path d="M19 12H5M12 19l-7-7 7-7" />,
    split: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 3v18" />
        </>
    ),
    maximize: <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />,
    minimize: <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />,
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
    ),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
    monitor: (
        <>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </>
    ),
    tablet: (
        <>
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M12 18h.01" />
        </>
    ),
    phone: (
        <>
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <path d="M12 18h.01" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </>
    ),
    tag: (
        <>
            <path d="M2 8.4V4a2 2 0 0 1 2-2h4.4a2 2 0 0 1 1.4.6l9.6 9.6a2 2 0 0 1 0 2.8l-4.4 4.4a2 2 0 0 1-2.8 0L2.6 9.8A2 2 0 0 1 2 8.4z" />
            <circle cx="7" cy="7" r="1.2" />
        </>
    ),
    layers: <path d="m12 2 9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />,
    settings: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.74.66 1.65 1.65 0 0 0-1.2 1.49V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.49-1.2H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.6h.09A1.65 1.65 0 0 0 9.6 2.11V2a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 8v.09a1.65 1.65 0 0 0 1.49 1.2H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.2z" />
        </>
    ),
    callout: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 16v-4M12 8h.01" />
        </>
    ),
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    save: <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />,
    sparkles: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z" />,
    details: <path d="m9 6 6 6-6 6" />,
    external: <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />,
};

export default function Icon({
    name,
    className,
    ...rest
}: { name: IconName } & React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn('size-5 shrink-0', className)}
            {...rest}
        >
            {PATHS[name]}
        </svg>
    );
}
