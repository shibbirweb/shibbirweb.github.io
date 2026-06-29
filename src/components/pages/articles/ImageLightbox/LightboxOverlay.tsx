'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ChevronIcon from '@/components/icons/chevron';
import CloseIcon from '@/components/icons/close';
import { useModalChrome } from '@/components/pages/articles/hooks/useModalChrome';
import { cn } from '@/utils/cn';
import type { ArticleImage } from '@/components/pages/articles/ImageLightbox/hooks/useArticleImages';

/** A round control button floating over the dimmed backdrop. Forwards `ref`
 *  (React 19 ref-as-prop) so the overlay can focus the close button on open. */
function OverlayButton({
    className,
    type,
    children,
    ...rest
}: React.ComponentPropsWithRef<'button'>) {
    return (
        <button
            type={type ?? 'button'}
            className={cn(
                'flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none',
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
}

/**
 * Full-screen image viewer over a dimmed backdrop. Closes on the close button,
 * Escape, or a backdrop click; pages with the arrow buttons or Left/Right keys
 * (wrapping around). Locks body scroll and restores focus to the trigger image
 * on dismiss.
 */
export default function LightboxOverlay({
    images,
    index,
    onIndexChange,
    onClose,
}: {
    images: ArticleImage[];
    index: number;
    onIndexChange: (next: number) => void;
    onClose: () => void;
}) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const hasMultiple = images.length > 1;

    const goTo = useCallback(
        (next: number) => {
            const count = images.length;
            onIndexChange((next + count) % count);
        },
        [images.length, onIndexChange]
    );

    // Scroll lock, focus management, and Escape live in the shared modal hook,
    // mounted once; only the left/right paging re-binds as the index changes.
    useModalChrome(onClose, closeRef);

    useEffect(() => {
        if (!hasMultiple) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') goTo(index + 1);
            else if (event.key === 'ArrowLeft') goTo(index - 1);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [hasMultiple, index, goTo]);

    const image = images[index];

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="absolute top-4 right-4 z-10">
                <OverlayButton
                    ref={closeRef}
                    aria-label="Close image viewer"
                    onClick={onClose}
                >
                    <CloseIcon className="size-5" />
                </OverlayButton>
            </div>

            {hasMultiple && (
                <>
                    <div className="absolute inset-y-0 left-4 z-10 flex items-center">
                        <OverlayButton
                            aria-label="Previous image"
                            onClick={() => goTo(index - 1)}
                        >
                            <ChevronIcon className="size-5 -rotate-90" />
                        </OverlayButton>
                    </div>
                    <div className="absolute inset-y-0 right-4 z-10 flex items-center">
                        <OverlayButton
                            aria-label="Next image"
                            onClick={() => goTo(index + 1)}
                        >
                            <ChevronIcon className="size-5 rotate-90" />
                        </OverlayButton>
                    </div>
                </>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element -- raw markdown
                image shown at native size; the export optimizer only wraps
                build-time <ExportedImage> sources, not these runtime previews. */}
            <img
                src={image.src}
                alt={image.alt}
                className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            />

            <div className="mt-4 flex max-w-2xl flex-col items-center gap-1 text-center">
                {image.alt && (
                    <p className="text-sm text-white/80">{image.alt}</p>
                )}
                {hasMultiple && (
                    <p className="text-xs text-white/50">
                        {index + 1} / {images.length}
                    </p>
                )}
            </div>
        </div>,
        document.body
    );
}
