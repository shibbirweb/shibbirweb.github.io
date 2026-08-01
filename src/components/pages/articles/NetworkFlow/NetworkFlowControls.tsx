'use client';

import { cn } from '@/utils/cn';
import ChevronIcon from '@/components/icons/chevron';
import PauseIcon from '@/components/icons/pause';
import PlayIcon from '@/components/icons/play';
import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';
import type { NetworkFlowScenario } from '@/components/pages/articles/NetworkFlow/types';

interface NetworkFlowControlsProps {
    scenarios: NetworkFlowScenario[];
    activeScenarioId: string;
    onSelectScenario: (scenarioId: string) => void;
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
 * The control bar: the scenario switch on one side, playback on the other.
 * Stepping is entered by pressing either step arrow, so there is no separate
 * mode selector for the reader to reason about.
 */
export default function NetworkFlowControls({
    scenarios,
    activeScenarioId,
    onSelectScenario,
    isPlaying,
    isStepping,
    stepIndex,
    stepCount,
    onPlay,
    onPause,
    onStepForward,
    onStepBackward,
    showPlayControl,
}: NetworkFlowControlsProps) {
    // A diagram with a single scenario has nothing to switch between, so the
    // control bar drops the group entirely rather than showing one pill that is
    // permanently pressed. Playback then carries `ml-auto` to stay on the right,
    // since `justify-between` alone would pull it across to the empty left edge.
    const hasScenarioChoice = scenarios.length > 1;

    return (
        <div className={styles.controls}>
            {hasScenarioChoice && (
                <div
                    className={styles.scenarioSwitch}
                    role="group"
                    aria-label="Diagram scenario"
                >
                    {scenarios.map((scenario) => (
                        <button
                            key={scenario.id}
                            type="button"
                            onClick={() => onSelectScenario(scenario.id)}
                            aria-pressed={scenario.id === activeScenarioId}
                            className={styles.scenarioButton}
                        >
                            {scenario.label}
                        </button>
                    ))}
                </div>
            )}

            <div className={cn(styles.playback, !hasScenarioChoice && 'ml-auto')}>
                <span className={styles.stepCounter} aria-live="polite">
                    {isStepping ? `Hop ${stepIndex + 1} of ${stepCount}` : 'Live traffic'}
                </span>
                <button
                    type="button"
                    onClick={onStepBackward}
                    aria-label="Previous hop"
                    className={styles.iconButton}
                >
                    <ChevronIcon className="size-4 -rotate-90" />
                </button>
                {showPlayControl && (
                    <button
                        type="button"
                        onClick={isPlaying && !isStepping ? onPause : onPlay}
                        aria-label={
                            isPlaying && !isStepping
                                ? 'Pause the flow'
                                : 'Play the flow'
                        }
                        className={styles.iconButton}
                    >
                        {isPlaying && !isStepping ? (
                            <PauseIcon className="size-4" />
                        ) : (
                            <PlayIcon className="size-4" />
                        )}
                    </button>
                )}
                <button
                    type="button"
                    onClick={onStepForward}
                    aria-label="Next hop"
                    className={styles.iconButton}
                >
                    <ChevronIcon className="size-4 rotate-90" />
                </button>
            </div>
        </div>
    );
}
