import { cn } from '@/utils/cn';

export default function Server({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-5', className)}
            {...rest}
        >
            <rect
                width="20"
                height="8"
                x="2"
                y="2"
                rx="2"
            />
            <rect
                width="20"
                height="8"
                x="2"
                y="14"
                rx="2"
            />
            <path d="M6 6h.01" />
            <path d="M6 18h.01" />
        </svg>
    );
}
