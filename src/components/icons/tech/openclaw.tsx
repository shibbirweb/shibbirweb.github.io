import { cn } from '@/utils/cn';

export default function OpenClawIcon({
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
            aria-hidden="true"
            className={cn('size-10', className)}
            {...rest}
        >
            <path d="M12 2v3" />
            <path d="M7 8a5 5 0 0 1 10 0" />
            <path d="M7 8c-1 4 0 8 2 11" />
            <path d="M17 8c1 4 0 8-2 11" />
            <path d="M12 8v11" />
        </svg>
    );
}
