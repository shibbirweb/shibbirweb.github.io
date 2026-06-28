import { cn } from '@/utils/cn';

export default function KotlinIcon({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={cn('size-10', className)}
            {...rest}
        >
            <path d="M24 24H0V0h24L12 12Z" />
        </svg>
    );
}
