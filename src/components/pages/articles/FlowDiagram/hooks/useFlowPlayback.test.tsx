import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFlowPlayback } from '@/components/pages/articles/FlowDiagram/hooks/useFlowPlayback';

interface PlaybackProps {
    hopCount: number;
    scenarioId: string;
    prefersReducedMotion: boolean;
}

const defaultProps: PlaybackProps = {
    hopCount: 3,
    scenarioId: 'router-wide',
    prefersReducedMotion: false,
};

function renderPlayback(props: Partial<PlaybackProps> = {}) {
    return renderHook(
        (hookProps: PlaybackProps) => useFlowPlayback(hookProps),
        {
            initialProps: { ...defaultProps, ...props },
        }
    );
}

describe('useFlowPlayback', () => {
    it('starts in the playing loop at the first hop', () => {
        const { result } = renderPlayback();

        expect(result.current.isPlaying).toBe(true);
        expect(result.current.isStepping).toBe(false);
        expect(result.current.stepIndex).toBe(0);
    });

    it('enters stepping and pauses the loop when stepping forward', () => {
        const { result } = renderPlayback();

        act(() => result.current.stepForward());

        expect(result.current.isStepping).toBe(true);
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.stepIndex).toBe(1);
    });

    it('wraps forward past the last hop back to the first', () => {
        const { result } = renderPlayback({ hopCount: 3 });

        act(() => result.current.stepForward());
        act(() => result.current.stepForward());
        act(() => result.current.stepForward());

        expect(result.current.stepIndex).toBe(0);
    });

    it('wraps backward from the first hop to the last', () => {
        const { result } = renderPlayback({ hopCount: 3 });

        act(() => result.current.stepBackward());

        expect(result.current.isStepping).toBe(true);
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.stepIndex).toBe(2);
    });

    it('stays on step zero when the scenario has no hops', () => {
        const { result } = renderPlayback({ hopCount: 0 });

        act(() => result.current.stepForward());
        act(() => result.current.stepBackward());

        expect(result.current.stepIndex).toBe(0);
    });

    it('returns to the loop when play is pressed', () => {
        const { result } = renderPlayback();

        act(() => result.current.stepForward());
        act(() => result.current.play());

        expect(result.current.isStepping).toBe(false);
        expect(result.current.isPlaying).toBe(true);
    });

    it('pauses without entering stepping', () => {
        const { result } = renderPlayback();

        act(() => result.current.pause());

        expect(result.current.isPlaying).toBe(false);
        expect(result.current.isStepping).toBe(false);
    });

    it('resets the step when the scenario changes', () => {
        const { result, rerender } = renderPlayback();

        act(() => result.current.stepForward());
        act(() => result.current.stepForward());
        expect(result.current.stepIndex).toBe(2);

        rerender({ ...defaultProps, scenarioId: 'vpn' });

        expect(result.current.stepIndex).toBe(0);
    });

    it('starts in stepping mode for readers who prefer reduced motion', () => {
        const { result } = renderPlayback({ prefersReducedMotion: true });

        expect(result.current.isStepping).toBe(true);
        expect(result.current.isPlaying).toBe(false);
    });

    it('adopts stepping once reduced motion resolves after mount', () => {
        const { result, rerender } = renderPlayback();

        rerender({ ...defaultProps, prefersReducedMotion: true });

        expect(result.current.isStepping).toBe(true);
        expect(result.current.isPlaying).toBe(false);
    });
});
