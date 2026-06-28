import { cn } from '@/utils/cn';

/** Chevron pointing up by default; rotate via className for other directions. */
export default function ChevronIcon({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-5', className)}
            {...rest}
        >
            <path d="M18 15l-6-6-6 6" />
        </svg>
    );
}
