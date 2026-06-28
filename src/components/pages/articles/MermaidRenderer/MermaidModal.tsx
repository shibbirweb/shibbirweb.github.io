'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@/components/icons/close';
import MermaidIconButton from '@/components/pages/articles/MermaidRenderer/MermaidIconButton';
import MermaidCopyButton from '@/components/pages/articles/MermaidRenderer/MermaidCopyButton';
import MermaidStage from '@/components/pages/articles/MermaidRenderer/MermaidStage';

interface MermaidModalProps {
    svg: string;
    source: string;
    onClose: () => void;
}

/**
 * Full-view diagram in a modal popup over a dimmed backdrop. Closes on the close
 * button, the Escape key, or a click on the backdrop. Locks body scroll and
 * restores focus to the trigger when dismissed.
 */
export default function MermaidModal({ svg, source, onClose }: MermaidModalProps) {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [onClose]);

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Diagram, full view"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-8"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="border-foreground/10 bg-background relative h-full w-full overflow-hidden rounded-xl border shadow-2xl">
                <MermaidStage svg={svg} enableWheel allowTouchPan />
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                    <MermaidCopyButton source={source} />
                    <MermaidIconButton
                        ref={closeRef}
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <CloseIcon className="size-4" />
                    </MermaidIconButton>
                </div>
            </div>
        </div>,
        document.body
    );
}
