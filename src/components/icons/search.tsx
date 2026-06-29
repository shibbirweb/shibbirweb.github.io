import { cn } from '@/utils/cn';

export default function Search({
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
            <circle cx={11} cy={11} r={7} />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}
