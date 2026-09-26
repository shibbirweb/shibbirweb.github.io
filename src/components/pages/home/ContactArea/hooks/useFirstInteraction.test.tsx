import {
    act,
    fireEvent,
    render,
    renderHook,
    screen,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFirstInteraction } from '@/components/pages/home/ContactArea/hooks/useFirstInteraction';

function InteractionHarness() {
    const { hasInteracted, interactionProps } = useFirstInteraction();

    return (
        <div>
            <form {...interactionProps}>
                <input aria-label="Name" />
                <p>Plain text</p>
            </form>
            <button type="button">Outside</button>
            <output>{hasInteracted ? 'engaged' : 'idle'}</output>
        </div>
    );
}

describe('useFirstInteraction', () => {
    it('starts idle', () => {
        render(<InteractionHarness />);

        expect(screen.getByText('idle')).toBeInTheDocument();
    });

    it('latches when focus enters the subtree', () => {
        render(<InteractionHarness />);

        fireEvent.focus(screen.getByRole('textbox', { name: 'Name' }));

        expect(screen.getByText('engaged')).toBeInTheDocument();
    });

    it('latches on a press on non-focusable content inside', () => {
        render(<InteractionHarness />);

        fireEvent.pointerDown(screen.getByText('Plain text'));

        expect(screen.getByText('engaged')).toBeInTheDocument();
    });

    it('ignores interactions outside the subtree', () => {
        render(<InteractionHarness />);

        fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
        fireEvent.focus(screen.getByRole('button', { name: 'Outside' }));

        expect(screen.getByText('idle')).toBeInTheDocument();
    });

    it('latches from markInteracted and never flips back', () => {
        const { result, rerender } = renderHook(() => useFirstInteraction());

        act(() => result.current.markInteracted());
        rerender();
        act(() => result.current.markInteracted());

        expect(result.current.hasInteracted).toBe(true);
    });

    it('keeps the interaction props stable across renders', () => {
        const { result, rerender } = renderHook(() => useFirstInteraction());
        const firstProps = result.current.interactionProps;

        act(() => result.current.markInteracted());
        rerender();

        expect(result.current.interactionProps).toBe(firstProps);
    });
});
