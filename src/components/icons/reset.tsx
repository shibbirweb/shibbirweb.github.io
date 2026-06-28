import { cn } from '@/utils/cn';

export default function ResetIcon({
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
            <polyline points="3 4 3 10 9 10" />
            <path d="M5.64 16a9 9 0 1 0 1.5-10.36L3 10" />
        </svg>
    );
}
