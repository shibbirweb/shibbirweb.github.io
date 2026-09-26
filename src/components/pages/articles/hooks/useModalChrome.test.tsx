import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useModalChrome } from '@/components/pages/articles/hooks/useModalChrome';

function Overlay({
    onClose,
    trapFocus = true,
}: {
    onClose: () => void;
    trapFocus?: boolean;
}) {
    const firstRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useModalChrome(onClose, firstRef, trapFocus ? containerRef : undefined);

    return (
        <div
            ref={containerRef}
            role="dialog"
        >
            <button ref={firstRef}>First</button>
            <button>Last</button>
        </div>
    );
}

/** jsdom has no layout, so offsetParent is always null; give buttons one. */
function stubVisibleLayout() {
    vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(
        document.body
    );
}

afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
});

describe('useModalChrome', () => {
    it('moves focus to the initial focus target on mount', () => {
        render(<Overlay onClose={() => {}} />);

        expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    });

    it('locks body scroll and restores the previous value on unmount', () => {
        document.body.style.overflow = 'scroll';
        const { unmount } = render(<Overlay onClose={() => {}} />);
        expect(document.body.style.overflow).toBe('hidden');

        unmount();

        expect(document.body.style.overflow).toBe('scroll');
    });

    it('returns focus to the previously focused element on unmount', () => {
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        opener.focus();

        const { unmount } = render(<Overlay onClose={() => {}} />);
        expect(opener).not.toHaveFocus();
        unmount();

        expect(opener).toHaveFocus();
        opener.remove();
    });

    it('calls onClose on Escape', () => {
        const onClose = vi.fn();
        render(<Overlay onClose={onClose} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('always calls the latest onClose without re-running the effect', () => {
        const firstClose = vi.fn();
        const latestClose = vi.fn();
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        opener.focus();

        const { rerender, unmount } = render(<Overlay onClose={firstClose} />);
        rerender(<Overlay onClose={latestClose} />);
        fireEvent.keyDown(document, { key: 'Escape' });

        expect(firstClose).not.toHaveBeenCalled();
        expect(latestClose).toHaveBeenCalledTimes(1);

        unmount();
        expect(opener).toHaveFocus();
        opener.remove();
    });

    it('stops listening for Escape once unmounted', () => {
        const onClose = vi.fn();
        const { unmount } = render(<Overlay onClose={onClose} />);
        unmount();

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).not.toHaveBeenCalled();
    });

    it('wraps Tab from the last focusable back to the first', () => {
        stubVisibleLayout();
        render(<Overlay onClose={() => {}} />);
        const last = screen.getByRole('button', { name: 'Last' });
        last.focus();

        const notCancelled = fireEvent.keyDown(document, { key: 'Tab' });

        expect(notCancelled).toBe(false);
        expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    });

    it('wraps Shift+Tab from the first focusable to the last', () => {
        stubVisibleLayout();
        render(<Overlay onClose={() => {}} />);

        const notCancelled = fireEvent.keyDown(document, {
            key: 'Tab',
            shiftKey: true,
        });

        expect(notCancelled).toBe(false);
        expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    });

    it('pulls focus back inside when it has escaped the dialog', () => {
        stubVisibleLayout();
        const outside = document.createElement('button');
        render(<Overlay onClose={() => {}} />);
        document.body.appendChild(outside);
        outside.focus();

        fireEvent.keyDown(document, { key: 'Tab' });

        expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
        outside.remove();
    });

    it('lets Tab move normally between middle elements', () => {
        stubVisibleLayout();
        render(<Overlay onClose={() => {}} />);

        const notCancelled = fireEvent.keyDown(document, { key: 'Tab' });

        expect(notCancelled).toBe(true);
    });

    it('does not trap Tab without a container', () => {
        stubVisibleLayout();
        render(
            <Overlay
                onClose={() => {}}
                trapFocus={false}
            />
        );
        screen.getByRole('button', { name: 'Last' }).focus();

        const notCancelled = fireEvent.keyDown(document, { key: 'Tab' });

        expect(notCancelled).toBe(true);
    });
});
