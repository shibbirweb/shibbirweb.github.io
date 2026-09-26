import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { KeyboardEvent } from 'react';
import {
    PAN_STEP,
    useDiagramViewportKeys,
} from '@/components/pages/articles/hooks/useDiagramViewportKeys';

function setup() {
    const actions = {
        panBy: vi.fn(),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        reset: vi.fn(),
    };
    const { result } = renderHook(() => useDiagramViewportKeys(actions));
    const press = (key: string) => {
        const event = { key, preventDefault: vi.fn() };
        result.current(event as unknown as KeyboardEvent);
        return event;
    };
    return { actions, press };
}

describe('useDiagramViewportKeys', () => {
    it.each([
        ['ArrowUp', 0, PAN_STEP],
        ['ArrowDown', 0, -PAN_STEP],
        ['ArrowLeft', PAN_STEP, 0],
        ['ArrowRight', -PAN_STEP, 0],
    ])('%s pans by (%i, %i) and claims the key', (key, deltaX, deltaY) => {
        const { actions, press } = setup();

        const event = press(key);

        expect(actions.panBy).toHaveBeenCalledWith(deltaX, deltaY);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it.each(['+', '='])('%s zooms in', (key) => {
        const { actions, press } = setup();

        const event = press(key);

        expect(actions.zoomIn).toHaveBeenCalledTimes(1);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it.each(['-', '_'])('%s zooms out', (key) => {
        const { actions, press } = setup();

        const event = press(key);

        expect(actions.zoomOut).toHaveBeenCalledTimes(1);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('0 resets to the fitted view', () => {
        const { actions, press } = setup();

        const event = press('0');

        expect(actions.reset).toHaveBeenCalledTimes(1);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it.each(['Tab', 'Enter', 'a', '1', ' '])(
        'lets %j fall through untouched',
        (key) => {
            const { actions, press } = setup();

            const event = press(key);

            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(actions.panBy).not.toHaveBeenCalled();
            expect(actions.zoomIn).not.toHaveBeenCalled();
            expect(actions.zoomOut).not.toHaveBeenCalled();
            expect(actions.reset).not.toHaveBeenCalled();
        }
    );
});
