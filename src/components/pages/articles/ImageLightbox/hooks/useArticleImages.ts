'use client';

import { useEffect, useState } from 'react';

export interface ArticleImage {
    src: string;
    alt: string;
}

/**
 * Collects the content images in the article body (excluding embedded gists,
 * which bring their own chrome) and makes each one open the lightbox: it sets a
 * zoom cursor, exposes the image as a button to assistive tech, and wires click
 * plus Enter/Space to `onActivate(index)`. Returns the gallery in document order
 * so the overlay can page through it. All DOM tweaks are reverted on cleanup.
 */
export function useArticleImages(
    onActivate: (index: number) => void
): ArticleImage[] {
    const [images, setImages] = useState<ArticleImage[]>([]);

    useEffect(() => {
        const elements = Array.from(
            document.querySelectorAll<HTMLImageElement>('article .prose img')
        ).filter((img) => !img.closest('.gist-embed'));
        if (elements.length === 0) return;

        const cleanups = elements.map((img, index) => {
            const previousCursor = img.style.cursor;
            const previousRole = img.getAttribute('role');
            const previousTabIndex = img.getAttribute('tabindex');
            const previousTitle = img.getAttribute('title');

            img.style.cursor = 'zoom-in';
            img.setAttribute('role', 'button');
            img.setAttribute('tabindex', '0');
            if (!previousTitle) img.setAttribute('title', 'Click to zoom');

            const activate = () => onActivate(index);
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activate();
                }
            };
            img.addEventListener('click', activate);
            img.addEventListener('keydown', onKeyDown);

            return () => {
                img.style.cursor = previousCursor;
                if (previousRole === null) img.removeAttribute('role');
                else img.setAttribute('role', previousRole);
                if (previousTabIndex === null) img.removeAttribute('tabindex');
                else img.setAttribute('tabindex', previousTabIndex);
                if (previousTitle === null) img.removeAttribute('title');
                img.removeEventListener('click', activate);
                img.removeEventListener('keydown', onKeyDown);
            };
        });

        setImages(elements.map((img) => ({ src: img.src, alt: img.alt })));

        return () => {
            for (const cleanup of cleanups) cleanup();
            setImages([]);
        };
    }, [onActivate]);

    return images;
}
