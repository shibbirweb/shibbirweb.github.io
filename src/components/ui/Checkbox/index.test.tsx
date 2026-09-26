import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Checkbox from '@/components/ui/Checkbox';

describe('Checkbox', () => {
    it('is named by its label', () => {
        render(<Checkbox label="Reload automatically" />);

        expect(
            screen.getByRole('checkbox', { name: 'Reload automatically' })
        ).not.toBeChecked();
    });

    it('toggles when the label text is clicked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <Checkbox
                label="Reload automatically"
                onChange={onChange}
            />
        );

        await user.click(screen.getByText('Reload automatically'));

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('forwards data attributes and input props', () => {
        render(
            <Checkbox
                label="Draft"
                data-network-autoreload
                defaultChecked
                name="draft"
            />
        );

        const checkbox = screen.getByRole('checkbox', { name: 'Draft' });
        expect(checkbox).toHaveAttribute('data-network-autoreload');
        expect(checkbox).toHaveAttribute('name', 'draft');
        expect(checkbox).toBeChecked();
    });

    it('merges classes onto the input and the label', () => {
        render(
            <Checkbox
                label="Draft"
                className="accent-emerald-500"
                labelClassName="text-xs"
            />
        );

        const checkbox = screen.getByRole('checkbox', { name: 'Draft' });
        expect(checkbox).toHaveClass('accent-emerald-500');
        expect(checkbox).not.toHaveClass('accent-foreground');
        expect(checkbox.closest('label')).toHaveClass('text-xs');
    });
});
