'use client';

import { useState } from 'react';
import LightboxOverlay from '@/components/pages/articles/ImageLightbox/LightboxOverlay';
import { useArticleImages } from '@/components/pages/articles/ImageLightbox/hooks/useArticleImages';

/**
 * Turns every content image in the article body into a click-to-zoom trigger for
 * a full-screen viewer with keyboard navigation. Like the code and Mermaid
 * enhancers, it owns no markup of its own (beyond the portalled overlay) and is
 * a no-op on articles without images.
 */
export default function ImageLightbox() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const images = useArticleImages(setOpenIndex);

    if (openIndex === null || images.length === 0) return null;

    return (
        <LightboxOverlay
            images={images}
            index={openIndex}
            onIndexChange={setOpenIndex}
            onClose={() => setOpenIndex(null)}
        />
    );
}
