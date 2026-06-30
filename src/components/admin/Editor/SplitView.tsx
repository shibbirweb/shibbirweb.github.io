'use client';

import { useSplitDrag } from '@/components/admin/Editor/hooks/useSplitDrag';

/**
 * A horizontally resizable two-pane layout for Split mode. Dragging the divider
 * adjusts the left pane between 30% and 75%; panes stack on narrow screens.
 */
export default function SplitView({
    left,
    right,
}: {
    left: React.ReactNode;
    right: React.ReactNode;
}) {
    const { containerRef, leftPercent, startDrag } = useSplitDrag();

    return (
        <div
            ref={containerRef}
            className="flex h-full min-h-0 min-w-0 flex-col md:flex-row"
        >
            <div
                className="min-h-0 min-w-0 max-md:h-1/2 max-md:border-b max-md:border-foreground/10"
                style={{ flexBasis: `${leftPercent}%` }}
            >
                {left}
            </div>
            <div
                role="separator"
                aria-orientation="vertical"
                onPointerDown={startDrag}
                className="bg-foreground/10 hover:bg-violet-500/60 hidden w-1 cursor-col-resize transition-colors md:block"
            />
            <div className="min-h-0 min-w-0 flex-1 max-md:h-1/2">{right}</div>
        </div>
    );
}
