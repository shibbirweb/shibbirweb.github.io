import type { Ref } from 'react';
import { cn } from '@/utils/cn';

/**
 * A diagram's source shown in place of the diagram, while mermaid loads or
 * when it cannot parse the block. Long lines make the box scroll sideways, so
 * it is focusable and labelled: keyboard users can reach it and scroll with
 * the arrow keys (axe's scrollable-region-focusable rule), and it shows the
 * shared focus ring. Each diagram type passes its own look in `className`, and
 * a `ref` to watch when the placeholder nears the viewport.
 */
export default function DiagramSourceFallback({
    source,
    className,
    ref,
}: {
    source: string;
    className?: string;
    ref?: Ref<HTMLPreElement>;
}) {
    return (
        <pre
            ref={ref}
            tabIndex={0}
            aria-label="Diagram source"
            className={cn('focus-ring', className)}
        >
            {source}
        </pre>
    );
}
