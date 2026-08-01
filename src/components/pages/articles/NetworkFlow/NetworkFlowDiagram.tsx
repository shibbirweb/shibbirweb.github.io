'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';
import NetworkFlowCaption from '@/components/pages/articles/NetworkFlow/NetworkFlowCaption';
import NetworkFlowControls from '@/components/pages/articles/NetworkFlow/NetworkFlowControls';
import NetworkFlowScene from '@/components/pages/articles/NetworkFlow/NetworkFlowScene';
import { useNetworkFlowPlayback } from '@/components/pages/articles/NetworkFlow/hooks/useNetworkFlowPlayback';
import { useSmilPlayback } from '@/components/pages/articles/NetworkFlow/hooks/useSmilPlayback';
import { usePrefersReducedMotion } from '@/components/pages/articles/hooks/usePrefersReducedMotion';
import type { NetworkFlowDefinition } from '@/components/pages/articles/NetworkFlow/types';

/**
 * One interactive network-flow diagram: a scenario switch, an animated SVG, and a
 * caption that explains whatever the reader last touched. Three ways in, all
 * driving the same picture: watch the loop, step a hop at a time, or click a box
 * to see what it does and which hops it is part of.
 */
export default function NetworkFlowDiagram({
    definition,
}: {
    definition: NetworkFlowDefinition;
}) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    const [scenarioId, setScenarioId] = useState(definition.scenarios[0].id);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const scenario =
        definition.scenarios.find((entry) => entry.id === scenarioId) ??
        definition.scenarios[0];

    const playback = useNetworkFlowPlayback({
        edgeCount: scenario.edges.length,
        scenarioId: scenario.id,
        prefersReducedMotion,
    });

    // Stepping needs the SMIL clock running for its single-run animation, so the
    // pause button only governs the continuous loop.
    useSmilPlayback(
        svgRef,
        playback.isStepping ? true : playback.isPlaying
    );

    // A selection made in one scenario means nothing in the next one.
    useEffect(() => {
        setSelectedNodeId(null);
    }, [scenarioId]);

    // Scenarios of the same diagram may have different numbers of hops, and the
    // playback hook resets its index in an effect, which runs only after this
    // render. Clamping here means the one render between switching to a shorter
    // scenario and that reset cannot read past the end of the edge list.
    const stepIndex = Math.min(playback.stepIndex, scenario.edges.length - 1);

    const selectedNode = selectedNodeId
        ? scenario.nodes.find((node) => node.id === selectedNodeId)
        : undefined;

    const caption = selectedNode
        ? { source: selectedNode.label, text: selectedNode.description }
        : playback.isStepping
          ? {
                source: `Hop ${stepIndex + 1}`,
                text: scenario.edges[stepIndex].caption,
            }
          : { source: scenario.label, text: scenario.summary };

    return (
        <figure className={cn('not-prose', styles.frame)}>
            <NetworkFlowControls
                scenarios={definition.scenarios}
                activeScenarioId={scenario.id}
                onSelectScenario={setScenarioId}
                isPlaying={playback.isPlaying}
                isStepping={playback.isStepping}
                stepIndex={stepIndex}
                stepCount={scenario.edges.length}
                onPlay={playback.play}
                onPause={playback.pause}
                onStepForward={playback.stepForward}
                onStepBackward={playback.stepBackward}
                showPlayControl={!prefersReducedMotion}
            />

            <NetworkFlowScene
                scenario={scenario}
                svgRef={svgRef}
                selectedNodeId={selectedNodeId}
                onSelectNode={(nodeId) =>
                    setSelectedNodeId((current) =>
                        current === nodeId ? null : nodeId
                    )
                }
                isStepping={playback.isStepping}
                stepIndex={stepIndex}
                animatePackets={!prefersReducedMotion}
                title={definition.title}
            />

            <figcaption>
                <NetworkFlowCaption
                    source={caption.source}
                    text={caption.text}
                />
                <span className={styles.hint}>
                    Switch the tunnel on and off, step through the hops, or
                    select a box to see what it does.
                </span>
            </figcaption>
        </figure>
    );
}
