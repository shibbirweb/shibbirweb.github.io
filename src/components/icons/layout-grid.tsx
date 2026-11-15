import { cn } from '@/utils/cn';

export default function LayoutGrid({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            className={cn('size-5', className)}
            {...rest}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="4"
                y="4"
                width="6.5"
                height="6.5"
                rx="1.5"
            />
            <rect
                x="13.5"
                y="4"
                width="6.5"
                height="6.5"
                rx="1.5"
            />
            <rect
                x="4"
                y="13.5"
                width="6.5"
                height="6.5"
                rx="1.5"
            />
            <rect
                x="13.5"
                y="13.5"
                width="6.5"
                height="6.5"
                rx="1.5"
            />
        </svg>
    );
}
