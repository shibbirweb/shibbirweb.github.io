import ChevronIcon from '@/components/icons/chevron';
import ResetIcon from '@/components/icons/reset';
import ZoomInIcon from '@/components/icons/zoom-in';
import ZoomOutIcon from '@/components/icons/zoom-out';
import MermaidIconButton from '@/components/pages/articles/MermaidRenderer/MermaidIconButton';
import { cn } from '@/utils/cn';

interface MermaidControlsProps {
    /** Shift the view by (dx, dy) pixels. */
    onPan: (dx: number, dy: number) => void;
    onReset: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    /** Pixels to pan per press. */
    step: number;
    className?: string;
}

/**
 * GitHub-style control cluster as a single 3x3 grid: the directional pad
 * (up / left / right / down) around a center reset, with zoom-in and zoom-out
 * sharing the right column (top and bottom corners).
 */
export default function MermaidControls({
    onPan,
    onReset,
    onZoomIn,
    onZoomOut,
    step,
    className,
}: MermaidControlsProps) {
    return (
        <div className={cn('grid grid-cols-3 gap-1', className)}>
            {/* row 1: up, zoom in */}
            <span aria-hidden="true" className="size-8" />
            <MermaidIconButton aria-label="Pan up" onClick={() => onPan(0, step)}>
                <ChevronIcon className="size-4" />
            </MermaidIconButton>
            <MermaidIconButton aria-label="Zoom in" onClick={onZoomIn}>
                <ZoomInIcon className="size-4" />
            </MermaidIconButton>

            {/* row 2: left, reset, right */}
            <MermaidIconButton
                aria-label="Pan left"
                onClick={() => onPan(step, 0)}
            >
                <ChevronIcon className="size-4 -rotate-90" />
            </MermaidIconButton>
            <MermaidIconButton aria-label="Reset view" onClick={onReset}>
                <ResetIcon className="size-4" />
            </MermaidIconButton>
            <MermaidIconButton
                aria-label="Pan right"
                onClick={() => onPan(-step, 0)}
            >
                <ChevronIcon className="size-4 rotate-90" />
            </MermaidIconButton>

            {/* row 3: down, zoom out */}
            <span aria-hidden="true" className="size-8" />
            <MermaidIconButton
                aria-label="Pan down"
                onClick={() => onPan(0, -step)}
            >
                <ChevronIcon className="size-4 rotate-180" />
            </MermaidIconButton>
            <MermaidIconButton aria-label="Zoom out" onClick={onZoomOut}>
                <ZoomOutIcon className="size-4" />
            </MermaidIconButton>
        </div>
    );
}
