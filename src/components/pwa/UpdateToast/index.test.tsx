import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UpdateToast from '@/components/pwa/UpdateToast';

describe('UpdateToast', () => {
    it('announces the update politely as a status', () => {
        render(
            <UpdateToast
                onReload={() => {}}
                onDismiss={() => {}}
            />
        );

        const toast = screen.getByRole('status');
        expect(toast).toHaveAttribute('aria-live', 'polite');
        expect(toast).toHaveTextContent('Update available');
    });

    it('calls onReload from the Reload button', async () => {
        const user = userEvent.setup();
        const onReload = vi.fn();
        const onDismiss = vi.fn();
        render(
            <UpdateToast
                onReload={onReload}
                onDismiss={onDismiss}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Reload' }));

        expect(onReload).toHaveBeenCalledTimes(1);
        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('calls onDismiss from the Dismiss button', async () => {
        const user = userEvent.setup();
        const onReload = vi.fn();
        const onDismiss = vi.fn();
        render(
            <UpdateToast
                onReload={onReload}
                onDismiss={onDismiss}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Dismiss' }));

        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(onReload).not.toHaveBeenCalled();
    });
});
