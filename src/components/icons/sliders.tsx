import { cn } from '@/utils/cn';

/** Two horizontal sliders: the usual "filters" mark. */
export default function SlidersIcon({
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
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
            <circle
                cx="16"
                cy="7"
                r="2"
            />
            <circle
                cx="8"
                cy="17"
                r="2"
            />
        </svg>
    );
}
