'use client';

import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import FlowPlayback from '@/components/pages/articles/FlowDiagram/FlowPlayback';
import FlowScenarioSwitch from '@/components/pages/articles/FlowDiagram/FlowScenarioSwitch';
import FlowViewSwitch from '@/components/pages/articles/FlowDiagram/FlowViewSwitch';
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
    /** Whether there is more than one route to switch between. */
    hasScenarioChoice: boolean;
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
 * other. It owns the layout and which groups appear, and nothing else; each group
 * is its own component and takes only what it needs.
 *
 * All the wording in these groups is deliberately neutral. They are shared by every
 * diagram on the site, so anything phrased for one subject (an earlier version said
 * "Live traffic", which meant nothing on a commit history) is wrong the moment a
 * second diagram exists.
 */
export default function FlowControls({
    view,
    onSelectView,
    scenarios,
    activeScenarioId,
    onSelectScenario,
    hasScenarioChoice,
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
    return (
        <div className={styles.controls}>
            <FlowViewSwitch
                view={view}
                onSelectView={onSelectView}
            />

            {hasScenarioChoice && (
                <FlowScenarioSwitch
                    scenarios={scenarios}
                    activeScenarioId={activeScenarioId}
                    onSelectScenario={onSelectScenario}
                />
            )}

            {/* Playback only means something in the interactive view; the static
                picture has no packets to run and no hops to walk. */}
            {view === 'interactive' && (
                <FlowPlayback
                    isPlaying={isPlaying}
                    isStepping={isStepping}
                    stepIndex={stepIndex}
                    stepCount={stepCount}
                    onPlay={onPlay}
                    onPause={onPause}
                    onStepForward={onStepForward}
                    onStepBackward={onStepBackward}
                    showPlayControl={showPlayControl}
                />
            )}
        </div>
    );
}
