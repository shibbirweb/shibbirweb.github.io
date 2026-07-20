import { cn } from '@/utils/cn';

export default function Sun({
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
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                cx="12"
                cy="12"
                r="4"
            />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
    );
}
