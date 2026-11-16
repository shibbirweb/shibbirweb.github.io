import type { CSSProperties } from 'react';
import ExportedImage from 'next-image-export-optimizer';
import { cn } from '@/utils/cn';

/**
 * Article cover/thumbnail. Covers are author-provided (SVG or raster) so they
 * render unoptimized; the export optimizer leaves them untouched. Covers load
 * lazily unless `eager` is set, which a grid uses for its first row: that cover
 * is the page's largest paint, so it should not wait for the lazy loader.
 */
export default function ArticleCover({
    src,
    alt = '',
    className,
    style,
    eager = false,
}: {
    src: string;
    alt?: string;
    className?: string;
    style?: CSSProperties;
    eager?: boolean;
}) {
    return (
        <ExportedImage
            src={src}
            alt={alt}
            width={1200}
            height={630}
            unoptimized
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            className={cn('bg-foreground/5 w-full object-cover', className)}
            style={style}
        />
    );
}
