import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Input from '@/components/ui/Input';

describe('Input', () => {
    it('is labelled by its label', () => {
        render(<Input label="Name" />);

        expect(
            screen.getByRole('textbox', { name: 'Name' })
        ).toBeInTheDocument();
    });

    it('announces a required field', () => {
        render(
            <Input
                label="Email"
                required
            />
        );

        const input = screen.getByRole('textbox', {
            name: /^Email\s*\(required\)$/,
        });
        expect(input).toBeRequired();
    });

    it('uses an explicit id when given', () => {
        render(
            <Input
                id="contact-name"
                label="Name"
            />
        );

        expect(screen.getByLabelText('Name')).toHaveAttribute(
            'id',
            'contact-name'
        );
    });

    it('carries no message wiring by default', () => {
        render(<Input label="Name" />);

        const input = screen.getByRole('textbox', { name: 'Name' });
        expect(input).not.toHaveAttribute('aria-invalid');
        expect(input).not.toHaveAttribute('aria-describedby');
    });

    it('wires an error as an alert and marks the field invalid', () => {
        render(
            <Input
                label="Email"
                error="Enter a valid email"
            />
        );

        const input = screen.getByRole('textbox', { name: 'Email' });
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('Enter a valid email');
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Enter a valid email'
        );
    });

    it('exposes helper text as a polite status', () => {
        render(
            <Input
                label="Name"
                helperText="As it should appear in the reply"
            />
        );

        const input = screen.getByRole('textbox', { name: 'Name' });
        expect(input).not.toHaveAttribute('aria-invalid');
        expect(input).toHaveAccessibleDescription(
            'As it should appear in the reply'
        );
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('lets the error replace the helper text', () => {
        render(
            <Input
                label="Name"
                helperText="Helpful"
                error="Required"
            />
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Required');
        expect(screen.queryByText('Helpful')).not.toBeInTheDocument();
    });

    it('forwards input props and change events', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                onChange={onChange}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Email' });
        await user.type(input, 'a');

        expect(input).toHaveAttribute('type', 'email');
        expect(input).toHaveAttribute('placeholder', 'you@example.com');
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('forwards the ref to the input element', () => {
        const ref = createRef<HTMLInputElement>();
        render(
            <Input
                ref={ref}
                label="Name"
            />
        );

        expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Name' }));
    });
});
