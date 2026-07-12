import { cn } from '@/utils/cn';

/**
 * Minimal loading spinner. The icon set has no spinner glyph, so this is a small
 * inline SVG: a faint full ring plus a bright arc that rotates via Tailwind's
 * `animate-spin` (motion-safe, so it stays still for reduced-motion users).
 */
export default function Spinner({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={cn('size-4 motion-safe:animate-spin', className)}
            {...rest}
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
            />
            <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}
