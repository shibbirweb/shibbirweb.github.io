import { cn } from '@/utils/cn';

/**
 * A diagram's source shown in place of the diagram, while mermaid loads or
 * when it cannot parse the block. Long lines make the box scroll sideways, so
 * it is focusable and labelled: keyboard users can reach it and scroll with
 * the arrow keys (axe's scrollable-region-focusable rule), and it shows the
 * shared focus ring. Each diagram type passes its own look in `className`.
 */
export default function DiagramSourceFallback({
    source,
    className,
}: {
    source: string;
    className?: string;
}) {
    return (
        <pre
            tabIndex={0}
            aria-label="Diagram source"
            className={cn('focus-ring', className)}
        >
            {source}
        </pre>
    );
}
