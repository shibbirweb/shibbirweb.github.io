'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/utils/cn';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import FlowCaption from '@/components/pages/articles/FlowDiagram/FlowCaption';
import FlowControls from '@/components/pages/articles/FlowDiagram/FlowControls';
import { useFlowPlayback } from '@/components/pages/articles/FlowDiagram/hooks/useFlowPlayback';
import { useInViewport } from '@/components/pages/articles/FlowDiagram/hooks/useInViewport';
import { useSmilPlayback } from '@/components/pages/articles/FlowDiagram/hooks/useSmilPlayback';
import { usePrefersReducedMotion } from '@/components/pages/articles/hooks/usePrefersReducedMotion';
import FlowStaticView from '@/components/pages/articles/FlowDiagram/FlowStaticView';
import type {
    FlowDiagramDefinition,
    FlowView,
} from '@/components/pages/articles/FlowDiagram/types';

// React Flow and dagre are a large dependency for a page that may have no diagram
// on it, so the canvas is split out and loaded on demand, mirroring how mermaid is
// dynamically imported. ssr:false because React Flow measures the DOM.
const FlowCanvas = dynamic(
    () => import('@/components/pages/articles/FlowDiagram/FlowCanvas'),
    { ssr: false }
);

/**
 * One interactive diagram: a scenario switch, an animated React Flow canvas, and a
 * caption explaining whatever the reader last touched. Three ways in, all driving
 * the same picture: watch the loop, step a hop at a time, or click a box.
 */
export default function FlowDiagram({
    definition,
}: {
    definition: FlowDiagramDefinition;
}) {
    const frameRef = useRef<HTMLElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    // Defaults to the lighter static picture unless the diagram asks otherwise
    // with a `default:` line, so React Flow's chunk is only fetched by readers who
    // press Interactive.
    const [view, setView] = useState<FlowView>(
        definition.defaultView ?? 'static'
    );
    const [scenarioId, setScenarioId] = useState(definition.scenarios[0].id);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const scenario =
        definition.scenarios.find((entry) => entry.id === scenarioId) ??
        definition.scenarios[0];

    // Same test FlowControls uses to decide whether to render the switch, derived
    // from the same array, so the hint below cannot describe a missing control.
    const hasScenarioChoice = definition.scenarios.length > 1;

    const playback = useFlowPlayback({
        hopCount: scenario.edgeIds.length,
        scenarioId: scenario.id,
        prefersReducedMotion,
    });

    const isInViewport = useInViewport(frameRef);

    // Stepping needs the SMIL clock running for its single-run animation, so the
    // pause button only governs the continuous loop. Either way the clock stops
    // while the diagram is off screen: an article can hold several of these, and
    // loops running where nobody can see them are pure battery cost. Visibility
    // gates the clock only, never `isPlaying`, so the play button keeps showing
    // what the reader chose rather than where the page happens to be scrolled.
    // Scoped to the stage, not the whole frame: the control bar is full of icon
    // SVGs, and freezing those would be pointless work on elements that never
    // animate. Only the canvas carries the packets.
    useSmilPlayback(
        stageRef,
        view === 'interactive' &&
            isInViewport &&
            (playback.isStepping || playback.isPlaying)
    );

    // A selection made in one scenario means nothing in the next one.
    useEffect(() => {
        setSelectedNodeId(null);
    }, [scenarioId]);

    // Scenarios of one diagram may route different numbers of hops, and the
    // playback hook resets its index in an effect that runs after this render.
    // Clamping means the render in between cannot read past the end of the list.
    const stepIndex = Math.min(
        playback.stepIndex,
        Math.max(scenario.edgeIds.length - 1, 0)
    );

    const selectedNode = selectedNodeId
        ? definition.nodes.find((node) => node.id === selectedNodeId)
        : undefined;
    const activeHop = definition.edges.find(
        (edge) => edge.id === scenario.edgeIds[stepIndex]
    );

    // Describe only the controls this diagram actually renders, and never its
    // subject. Wording tied to one diagram's story goes stale the moment another
    // is added.
    const hint =
        view === 'static'
            ? hasScenarioChoice
                ? 'Switch between the routes, or press Interactive to animate the traffic and step through it.'
                : 'Press Interactive to animate the traffic and step through it hop by hop.'
            : hasScenarioChoice
              ? 'Switch between the routes, step through the hops, or select a box to see what it does.'
              : 'Step through the hops, or select a box to see what it does.';

    const caption =
        view === 'static'
            ? { source: scenario.label, text: scenario.summary ?? '' }
            : selectedNode?.description
            ? { source: selectedNode.label, text: selectedNode.description }
            : playback.isStepping && activeHop?.caption
              ? { source: `Hop ${stepIndex + 1}`, text: activeHop.caption }
              : { source: scenario.label, text: scenario.summary ?? '' };

    return (
        // The surface attribute opts this frame into the delegated pointer
        // listener the SpotlightGroup around the article body already runs, so the
        // cursor spotlight costs no listener of its own. It resolves surfaces with
        // closest() on every move, which is why a diagram portaled in after mount
        // is picked up with nothing to register.
        <figure
            ref={frameRef}
            {...spotlightSurfaceProps}
            className={cn('not-prose', styles.frame)}
        >
            <FlowControls
                view={view}
                onSelectView={setView}
                scenarios={definition.scenarios}
                activeScenarioId={scenario.id}
                onSelectScenario={setScenarioId}
                isPlaying={playback.isPlaying}
                isStepping={playback.isStepping}
                stepIndex={stepIndex}
                stepCount={scenario.edgeIds.length}
                onPlay={playback.play}
                onPause={playback.pause}
                onStepForward={playback.stepForward}
                onStepBackward={playback.stepBackward}
                showPlayControl={!prefersReducedMotion}
            />

            <div ref={stageRef} className={styles.stage}>
                {view === 'interactive' ? (
                    <FlowCanvas
                        definition={definition}
                        scenario={scenario}
                        selectedNodeId={selectedNodeId}
                        isStepping={playback.isStepping}
                        stepIndex={stepIndex}
                        animate={!prefersReducedMotion}
                        onSelectNode={(nodeId) =>
                            setSelectedNodeId((current) =>
                                current === nodeId ? null : nodeId
                            )
                        }
                    />
                ) : (
                    <FlowStaticView
                        definition={definition}
                        scenario={scenario}
                    />
                )}
            </div>

            <figcaption>
                {caption.text && (
                    <FlowCaption source={caption.source} text={caption.text} />
                )}
                <span className={styles.hint}>{hint}</span>
            </figcaption>
            <SpotlightBorder className={styles.spotlightBorder} />
        </figure>
    );
}
