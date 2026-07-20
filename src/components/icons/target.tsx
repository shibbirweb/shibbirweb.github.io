import { cn } from '@/utils/cn';

export default function Target({
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
            <circle
                cx="12"
                cy="12"
                r="10"
            />
            <circle
                cx="12"
                cy="12"
                r="6"
            />
            <circle
                cx="12"
                cy="12"
                r="2"
            />
        </svg>
    );
}
