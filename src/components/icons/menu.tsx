import { cn } from '@/utils/cn';

export default function Menu({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            className={cn('', className)}
            {...rest}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}
