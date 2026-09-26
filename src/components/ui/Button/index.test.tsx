import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button, { buttonClassName } from '@/components/ui/Button';

describe('Button', () => {
    it('defaults to a non-submitting button', () => {
        render(<Button>Save</Button>);

        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'type',
            'button'
        );
    });

    it('honours an explicit type', () => {
        render(<Button type="submit">Send</Button>);

        expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute(
            'type',
            'submit'
        );
    });

    it('forwards click handlers and other attributes', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <Button
                onClick={onClick}
                data-network-reload
                aria-describedby="hint"
            >
                Try again
            </Button>
        );

        const button = screen.getByRole('button', { name: 'Try again' });
        await user.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(button).toHaveAttribute('data-network-reload');
        expect(button).toHaveAttribute('aria-describedby', 'hint');
    });

    it('is not busy and shows no spinner by default', () => {
        const { container } = render(<Button>Save</Button>);

        expect(screen.getByRole('button')).toHaveAttribute(
            'aria-busy',
            'false'
        );
        expect(container.querySelector('svg')).toBeNull();
    });

    it('disables itself and shows a decorative spinner while loading', () => {
        const { container } = render(<Button isLoading>Sending...</Button>);

        const button = screen.getByRole('button', { name: 'Sending...' });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-busy', 'true');
        expect(container.querySelector('svg')).toHaveAttribute(
            'aria-hidden',
            'true'
        );
    });

    it('does not fire clicks while disabled', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <Button
                disabled
                onClick={onClick}
            >
                Save
            </Button>
        );

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(screen.getByRole('button')).toBeDisabled();
        expect(onClick).not.toHaveBeenCalled();
    });

    it('merges the caller class with the variant styling', () => {
        render(
            <Button
                variant="outline"
                className="w-full"
            >
                Cancel
            </Button>
        );

        expect(screen.getByRole('button')).toHaveClass(
            'focus-ring',
            'border',
            'w-full'
        );
    });
});

describe('buttonClassName', () => {
    it('uses the primary variant by default', () => {
        expect(buttonClassName()).toContain('bg-foreground');
    });

    it('styles the text variant as an underlined link', () => {
        expect(buttonClassName('text')).toContain('underline');
    });

    it('lets the caller override conflicting utilities', () => {
        const className = buttonClassName('primary', 'px-2');

        expect(className).toContain('px-2');
        expect(className).not.toContain('px-5');
    });
});
