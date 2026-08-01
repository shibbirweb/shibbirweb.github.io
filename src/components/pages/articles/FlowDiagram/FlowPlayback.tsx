'use client';

import ChevronIcon from '@/components/icons/chevron';
import PauseIcon from '@/components/icons/pause';
import PlayIcon from '@/components/icons/play';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import { cn } from '@/utils/cn';

interface FlowPlaybackProps {
    isPlaying: boolean;
    isStepping: boolean;
    stepIndex: number;
    stepCount: number;
    onPlay: () => void;
    onPause: () => void;
    onStepForward: () => void;
    onStepBackward: () => void;
    /** Hides the play control, which does nothing when packets never move. */
    showPlayControl: boolean;
}

/**
 * Walking the diagram: a step counter and the arrows either side of it, with the
 * loop's play/pause between them.
 *
 * Stepping is entered by pressing either step arrow, so there is no separate mode
 * selector for the reader to reason about. Pause only governs the continuous loop,
 * which is why every label here checks `isStepping` before deciding what it says.
 *
 * Carries `ml-auto` because the control bar's other groups may be absent, and
 * justify-between alone would pull this across to an empty left edge.
 */
export default function FlowPlayback({
    isPlaying,
    isStepping,
    stepIndex,
    stepCount,
    onPlay,
    onPause,
    onStepForward,
    onStepBackward,
    showPlayControl,
}: FlowPlaybackProps) {
    const isLooping = isPlaying && !isStepping;

    return (
        <div className={cn(styles.playback, 'ml-auto')}>
            <span
                className={styles.stepCounter}
                aria-live="polite"
            >
                {isStepping
                    ? `Step ${stepIndex + 1} of ${stepCount}`
                    : `${stepCount} steps`}
            </span>
            <button
                type="button"
                onClick={onStepBackward}
                aria-label="Previous step"
                className={styles.iconButton}
            >
                <ChevronIcon className="size-4 -rotate-90" />
            </button>
            {showPlayControl && (
                <button
                    type="button"
                    onClick={isLooping ? onPause : onPlay}
                    aria-label={
                        isLooping ? 'Pause the animation' : 'Play the animation'
                    }
                    className={styles.iconButton}
                >
                    {isLooping ? (
                        <PauseIcon className="size-4" />
                    ) : (
                        <PlayIcon className="size-4" />
                    )}
                </button>
            )}
            <button
                type="button"
                onClick={onStepForward}
                aria-label="Next step"
                className={styles.iconButton}
            >
                <ChevronIcon className="size-4 rotate-90" />
            </button>
        </div>
    );
}
