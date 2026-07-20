import { cn } from '@/utils/cn';

export default function Monitor({
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
            <rect
                x="2"
                y="4"
                width="20"
                height="14"
                rx="2"
            />
            <path d="M8 22h8M12 18v4" />
        </svg>
    );
}
