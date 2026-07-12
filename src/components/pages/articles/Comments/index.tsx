'use client';

import { useRef } from 'react';
import {
    giscusRepo,
    giscusRepoId,
    giscusCategory,
    giscusCategoryId,
} from '@/config/constants';
import { useGiscus } from '@/components/pages/articles/Comments/hooks/useGiscus';
import { cn } from '@/utils/cn';

/**
 * Reader discussion under an article, powered by giscus (GitHub Discussions).
 * The widget is a client-only iframe injected by `useGiscus`; this component
 * just owns the container and its spacing. Threads are mapped by URL pathname,
 * so no per-article props are needed.
 */
export default function Comments() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGiscus(containerRef, {
        repo: giscusRepo,
        repoId: giscusRepoId,
        category: giscusCategory,
        categoryId: giscusCategoryId,
    });

    return (
        <section
            aria-label="Comments"
            className={cn('border-foreground/10 mt-16 border-t pt-10')}
        >
            <div ref={containerRef} />
        </section>
    );
}
