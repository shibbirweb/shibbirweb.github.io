'use client';

import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@/components/icons/close';
import { useModalChrome } from '@/components/pages/articles/hooks/useModalChrome';
import MermaidIconButton from '@/components/pages/articles/MermaidRenderer/MermaidIconButton';
import MermaidCopyButton from '@/components/pages/articles/MermaidRenderer/MermaidCopyButton';

interface DiagramModalProps {
    /** Text the copy button puts on the clipboard: the diagram's mermaid source. */
    source: string;
    /** Accessible name for the dialog, naming what is being shown full size. */
    label: string;
    onClose: () => void;
    /** The full-size stage: a mermaid SVG, or the React Flow canvas. */
    children: ReactNode;
}

/**
 * Full-view diagram in a modal popup over a dimmed backdrop. Closes on the close
 * button, the Escape key, or a click on the backdrop. Locks body scroll and
 * restores focus to the trigger when dismissed.
 *
 * Takes the stage as children because both diagram renderings open full view and
 * they are nothing alike inside: mermaid hands over a rendered SVG, React Flow
 * mounts a second live canvas. Everything around that stage is identical, so it
 * lives here once instead of in each of them.
 */
export default function DiagramModal({
    source,
    label,
    onClose,
    children,
}: DiagramModalProps) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    useModalChrome(onClose, closeRef, dialogRef);

    return createPortal(
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-8"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="border-foreground/10 bg-background relative h-full w-full overflow-hidden rounded-xl border shadow-2xl">
                {children}
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
