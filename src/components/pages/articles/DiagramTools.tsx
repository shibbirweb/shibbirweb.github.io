'use client';

import ExpandIcon from '@/components/icons/expand';
import MermaidIconButton from '@/components/pages/articles/MermaidRenderer/MermaidIconButton';
import MermaidCopyButton from '@/components/pages/articles/MermaidRenderer/MermaidCopyButton';
import { cn } from '@/utils/cn';

/**
 * The pair of buttons that sits in a diagram stage's top corner: open full view,
 * and copy the mermaid source. Every diagram on the site carries the same two, in
 * the same order, in the same place, whether it is a plain mermaid block or the
 * interactive canvas, so the reader learns them once.
 */
export default function DiagramTools({
    source,
    onOpenFullView,
    className,
}: {
    source: string;
    onOpenFullView: () => void;
    className?: string;
}) {
    return (
        <div className={cn('absolute z-10 flex gap-1', className)}>
            <MermaidIconButton
                aria-label="Full view"
                onClick={onOpenFullView}
            >
                <ExpandIcon className="size-4" />
            </MermaidIconButton>
            <MermaidCopyButton source={source} />
        </div>
    );
}
