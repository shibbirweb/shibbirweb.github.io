import { cn } from '@/utils/cn';

export default function Mouse({
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
                width="14"
                height="20"
                x="5"
                y="2"
                rx="7"
            />
            <path d="M12 6v4" />
        </svg>
    );
}
