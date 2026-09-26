import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DiagramModal from '@/components/pages/articles/DiagramModal';

afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.overflow = '';
});

function renderModal(onClose = vi.fn()) {
    const result = render(
        <DiagramModal
            source="graph TD; A-->B"
            label="Diagram, full view"
            onClose={onClose}
        >
            <p>Stage content</p>
        </DiagramModal>
    );
    return { ...result, onClose };
}

describe('DiagramModal', () => {
    it('renders a labelled modal dialog around the stage, portaled to body', () => {
        const { container } = renderModal();

        const dialog = screen.getByRole('dialog', {
            name: 'Diagram, full view',
        });
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog.parentElement).toBe(document.body);
        expect(container).not.toContainElement(dialog);
        expect(screen.getByText('Stage content')).toBeInTheDocument();
    });

    it('moves focus to the close button on open', () => {
        renderModal();

        expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    it('returns focus to the opener on unmount', () => {
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        opener.focus();

        const { unmount } = renderModal();
        unmount();

        expect(opener).toHaveFocus();
        opener.remove();
    });

    it('locks body scroll while open and restores it on unmount', () => {
        document.body.style.overflow = 'visible';
        const { unmount } = renderModal();
        expect(document.body.style.overflow).toBe('hidden');

        unmount();

        expect(document.body.style.overflow).toBe('visible');
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        const { onClose } = renderModal();

        await user.keyboard('{Escape}');

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes from the close button', async () => {
        const user = userEvent.setup();
        const { onClose } = renderModal();

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on a backdrop click but not a click on the stage', async () => {
        const user = userEvent.setup();
        const { onClose } = renderModal();

        await user.click(screen.getByText('Stage content'));
        expect(onClose).not.toHaveBeenCalled();

        await user.click(screen.getByRole('dialog'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('copies the diagram source from the copy button', async () => {
        const user = userEvent.setup();
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
        renderModal();

        await user.click(
            screen.getByRole('button', { name: 'Copy diagram source' })
        );

        expect(writeText).toHaveBeenCalledWith('graph TD; A-->B');
    });
});
