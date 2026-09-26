import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ServiceWorkerManager from '@/components/pwa/ServiceWorkerManager';
import { useServiceWorker } from '@/components/pwa/ServiceWorkerManager/hooks/useServiceWorker';

vi.mock('@/components/pwa/ServiceWorkerManager/hooks/useServiceWorker', () => ({
    useServiceWorker: vi.fn(),
}));

const mockedUseServiceWorker = vi.mocked(useServiceWorker);

describe('ServiceWorkerManager', () => {
    const applyUpdate = vi.fn();

    beforeEach(() => {
        applyUpdate.mockClear();
        mockedUseServiceWorker.mockReturnValue({
            updateReady: false,
            applyUpdate,
        });
    });

    it('renders nothing until an update is ready', () => {
        const { container } = render(<ServiceWorkerManager />);

        expect(container).toBeEmptyDOMElement();
    });

    it('shows the update toast once an update is ready', () => {
        const { rerender } = render(<ServiceWorkerManager />);

        mockedUseServiceWorker.mockReturnValue({
            updateReady: true,
            applyUpdate,
        });
        rerender(<ServiceWorkerManager />);

        expect(screen.getByRole('status')).toHaveTextContent(
            'Update available'
        );
    });

    it('applies the update from Reload', async () => {
        const user = userEvent.setup();
        mockedUseServiceWorker.mockReturnValue({
            updateReady: true,
            applyUpdate,
        });
        render(<ServiceWorkerManager />);

        await user.click(screen.getByRole('button', { name: 'Reload' }));

        expect(applyUpdate).toHaveBeenCalledTimes(1);
    });

    it('hides the toast for good once dismissed', async () => {
        const user = userEvent.setup();
        mockedUseServiceWorker.mockReturnValue({
            updateReady: true,
            applyUpdate,
        });
        const { rerender } = render(<ServiceWorkerManager />);

        await user.click(screen.getByRole('button', { name: 'Dismiss' }));
        act(() => {
            rerender(<ServiceWorkerManager />);
        });

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(applyUpdate).not.toHaveBeenCalled();
    });
});
