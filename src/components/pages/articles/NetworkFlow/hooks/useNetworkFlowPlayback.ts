'use client';

import { useCallback, useEffect, useState } from 'react';

interface PlaybackOptions {
    /** Number of hops in the active scenario; stepping wraps around it. */
    edgeCount: number;
    /** Resets stepping whenever the reader switches scenario. */
    scenarioId: string;
    prefersReducedMotion: boolean;
}

export interface NetworkFlowPlayback {
    /** True while the reader is walking hops by hand rather than watching the loop. */
    isStepping: boolean;
    /** Index into the scenario's edges; meaningful only while stepping. */
    stepIndex: number;
    /** True while packets should be moving. */
    isPlaying: boolean;
    play: () => void;
    pause: () => void;
    stepForward: () => void;
    stepBackward: () => void;
}

/**
 * Playback state for one diagram: the continuous packet loop, and the manual
 * hop-by-hop walk. Touching either step control leaves the loop and enters
 * stepping; pressing play returns to it. Visitors who ask for reduced motion
 * start in stepping mode, since for them the loop would never move anyway.
 */
export function useNetworkFlowPlayback({
    edgeCount,
    scenarioId,
    prefersReducedMotion,
}: PlaybackOptions): NetworkFlowPlayback {
    const [isStepping, setIsStepping] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Reduced motion is only known after mount, so adopt stepping once it resolves
    // rather than in the initial state (which must match the server render).
    useEffect(() => {
        if (prefersReducedMotion) {
            setIsStepping(true);
            setIsPlaying(false);
        }
    }, [prefersReducedMotion]);

    // A new scenario has its own hops, so start its walk from the beginning.
    useEffect(() => {
        setStepIndex(0);
    }, [scenarioId]);

    const play = useCallback(() => {
        setIsStepping(false);
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const stepForward = useCallback(() => {
        setIsStepping(true);
        setIsPlaying(false);
        setStepIndex((current) => (current + 1) % edgeCount);
    }, [edgeCount]);

    const stepBackward = useCallback(() => {
        setIsStepping(true);
        setIsPlaying(false);
        setStepIndex((current) => (current - 1 + edgeCount) % edgeCount);
    }, [edgeCount]);

    return {
        isStepping,
        stepIndex,
        isPlaying,
        play,
        pause,
        stepForward,
        stepBackward,
    };
}
