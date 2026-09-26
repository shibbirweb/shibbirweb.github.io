import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MobileMenuButton from '@/components/layout/Navbar/MobileMenuButton';

describe('MobileMenuButton', () => {
    it('offers to open the menu while closed', () => {
        render(
            <MobileMenuButton
                open={false}
                onToggle={() => {}}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Open menu' })
        ).toHaveAttribute('aria-expanded', 'false');
    });

    it('offers to close the menu while open', () => {
        render(
            <MobileMenuButton
                open
                onToggle={() => {}}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Close menu' })
        ).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls onToggle on click', async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();
        render(
            <MobileMenuButton
                open={false}
                onToggle={onToggle}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Open menu' }));

        expect(onToggle).toHaveBeenCalledTimes(1);
    });
});
