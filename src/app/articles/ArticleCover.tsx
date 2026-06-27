import ExportedImage from 'next-image-export-optimizer';
import { cn } from '@/utils/cn';

/**
 * Article cover/thumbnail. Covers are author-provided (SVG or raster) so they
 * render unoptimized; the export optimizer leaves them untouched.
 */
export default function ArticleCover({
    src,
    alt = '',
    className,
}: {
    src: string;
    alt?: string;
    className?: string;
}) {
    return (
        <ExportedImage
            src={src}
            alt={alt}
            width={1200}
            height={630}
            unoptimized
            className={cn('bg-foreground/5 w-full object-cover', className)}
        />
    );
}
