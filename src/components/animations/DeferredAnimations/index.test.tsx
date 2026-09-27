import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DeferredAnimations from '@/components/animations/DeferredAnimations';

describe('DeferredAnimations', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function renderGate(delayMs?: number) {
        render(
            <DeferredAnimations delayMs={delayMs}>
                <p>Shibbir Ahmed</p>
            </DeferredAnimations>
        );
        return screen.getByText('Shibbir Ahmed').parentElement!;
    }

    it('renders its children while the animations wait', () => {
        const gate = renderGate();

        expect(gate).toHaveAttribute('data-animations', 'waiting');
    });

    it('lets the animations run 5 seconds after load by default', () => {
        const gate = renderGate();

        act(() => {
            vi.advanceTimersByTime(4999);
        });
        expect(gate).toHaveAttribute('data-animations', 'waiting');

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(gate).toHaveAttribute('data-animations', 'running');
    });

    it('honours a custom delay', () => {
        const gate = renderGate(1000);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(gate).toHaveAttribute('data-animations', 'running');
    });
});
