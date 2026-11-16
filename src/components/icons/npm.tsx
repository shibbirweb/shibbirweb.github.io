import { cn } from '@/utils/cn';

/**
 * The npm mark (from Simple Icons, CC0), drawn as an outline rather than a solid
 * fill so it matches the line weight of the other social icons. The viewBox is
 * padded past the 24px artwork so the stroke never clips and the mark sits at
 * the same size as its neighbours.
 */
export default function NpmIcon({
    className,
    ...rest
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="-4 -4 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('size-10', className)}
            {...rest}
        >
            <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
        </svg>
    );
}
