import { cn } from '@/utils/cn';

/**
 * The Unsplash mark (from Simple Icons, CC0), drawn as an outline rather than a
 * solid fill so it matches the line weight of the other social icons. The
 * viewBox is padded past the 24px artwork so the stroke never clips.
 */
export default function UnsplashIcon({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="-3 -3 30 30"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('size-10', className)}
            {...rest}
        >
            <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
        </svg>
    );
}
