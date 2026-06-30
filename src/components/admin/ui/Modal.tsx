'use client';

import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayEscape } from '@/components/admin/ui/hooks/useOverlayEscape';
import { useLockBodyScroll } from '@/components/admin/ui/hooks/useLockBodyScroll';
import { useFocusTrap } from '@/components/admin/ui/hooks/useFocusTrap';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/utils/cn';

/**
 * A portalled, accessible dialog used across the Studio (confirmations, block
 * insert forms). Escape closes only the topmost overlay, focus is trapped and
 * restored, and page scroll is locked while open.
 */
export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    useOverlayEscape(open, onClose);
    useLockBodyScroll(open);
    useFocusTrap(open, panelRef);

    if (!open || typeof document === 'undefined') return null;

    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <button
                type="button"
                aria-label="Close dialog"
                className="fixed inset-0 cursor-default bg-black/50 backdrop-blur-sm motion-safe:animate-[fade-in_150ms_ease-out]"
                onClick={onClose}
            />
            <div
                ref={panelRef}
                tabIndex={-1}
                className={cn(
                    'bg-background scheme-light-dark relative my-auto w-full rounded-2xl border border-foreground/10 shadow-2xl outline-none motion-safe:animate-[modal-in_180ms_cubic-bezier(0.16,1,0.3,1)]',
                    widths[size]
                )}
            >
                <div className="flex items-start justify-between gap-4 border-b border-foreground/10 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold">{title}</h2>
                        {description && (
                            <p className="text-foreground/60 mt-0.5 text-sm">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-foreground/50 hover:bg-foreground/10 hover:text-foreground -mr-1 rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
                    >
                        <Icon name="close" className="size-5" />
                    </button>
                </div>
                {children && <div className="px-5 py-4">{children}</div>}
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-foreground/10 px-5 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
