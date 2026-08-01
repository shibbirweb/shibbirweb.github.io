'use client';

import { cn } from '@/utils/cn';
import ChevronIcon from '@/components/icons/chevron';
import PauseIcon from '@/components/icons/pause';
import PlayIcon from '@/components/icons/play';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import type {
    FlowScenario,
    FlowView,
} from '@/components/pages/articles/FlowDiagram/types';

interface FlowControlsProps {
    view: FlowView;
    onSelectView: (view: FlowView) => void;
    scenarios: FlowScenario[];
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
 * The control bar: the view and scenario switches on one side, playback on the
 * other. Stepping is entered by pressing either step arrow, so there is no
 * separate mode selector for the reader to reason about.
 *
 * All the wording here is deliberately neutral. This component is shared by every
 * diagram on the site, so anything phrased for one subject (an earlier version
 * said "Live traffic", which meant nothing on a commit history) is wrong the
 * moment a second diagram exists.
 */
export default function FlowControls({
    view,
    onSelectView,
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
}: FlowControlsProps) {
    // A diagram with a single scenario has nothing to switch between, so the bar
    // drops the group rather than showing one pill that is permanently pressed.
    // Playback then carries ml-auto to stay right, since justify-between alone
    // would pull it across to the empty left edge.
    const hasScenarioChoice = scenarios.length > 1;

    // Playback only means something in the interactive view; the static picture
    // has no packets to run and no hops to walk.
    const isInteractive = view === 'interactive';

    return (
        <div className={styles.controls}>
            <div
                className={styles.viewSwitch}
                role="group"
                aria-label="Diagram rendering"
            >
                <button
                    type="button"
                    onClick={() => onSelectView('static')}
                    aria-pressed={view === 'static'}
                    className={styles.scenarioButton}
                >
                    Static
                </button>
                <button
                    type="button"
                    onClick={() => onSelectView('interactive')}
                    aria-pressed={view === 'interactive'}
                    className={styles.scenarioButton}
                >
                    Interactive
                </button>
            </div>

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

            {isInteractive && (
            <div className={cn(styles.playback, 'ml-auto')}>
                <span className={styles.stepCounter} aria-live="polite">
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
                        onClick={isPlaying && !isStepping ? onPause : onPlay}
                        aria-label={
                            isPlaying && !isStepping
                                ? 'Pause the animation'
                                : 'Play the animation'
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
                    aria-label="Next step"
                    className={styles.iconButton}
                >
                    <ChevronIcon className="size-4 rotate-90" />
                </button>
            </div>
            )}
        </div>
    );
}
