import { cn } from '@/utils/cn';

export default function Code({
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
            <path d="m16 18 6-6-6-6" />
            <path d="m8 6-6 6 6 6" />
        </svg>
    );
}
