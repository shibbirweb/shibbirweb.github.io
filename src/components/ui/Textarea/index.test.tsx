import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Textarea from '@/components/ui/Textarea';

describe('Textarea', () => {
    it('renders a multiline field labelled by its label', () => {
        render(<Textarea label="Message" />);

        const field = screen.getByRole('textbox', { name: 'Message' });
        expect(field.tagName).toBe('TEXTAREA');
    });

    it('announces a required field', () => {
        render(
            <Textarea
                label="Message"
                required
            />
        );

        expect(
            screen.getByRole('textbox', { name: /^Message\s*\(required\)$/ })
        ).toBeRequired();
    });

    it('wires an error as an alert and marks the field invalid', () => {
        render(
            <Textarea
                label="Message"
                error="Say a little more"
            />
        );

        const field = screen.getByRole('textbox', { name: 'Message' });
        expect(field).toHaveAttribute('aria-invalid', 'true');
        expect(field).toHaveAccessibleDescription('Say a little more');
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('exposes helper text as a polite status', () => {
        render(
            <Textarea
                label="Message"
                helperText="Markdown is fine"
            />
        );

        expect(
            screen.getByRole('textbox', { name: 'Message' })
        ).toHaveAccessibleDescription('Markdown is fine');
        expect(screen.getByRole('status')).toHaveTextContent(
            'Markdown is fine'
        );
    });

    it('forwards props, change events, and the ref', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const ref = createRef<HTMLTextAreaElement>();
        render(
            <Textarea
                ref={ref}
                id="message"
                label="Message"
                rows={6}
                onChange={onChange}
            />
        );

        const field = screen.getByRole('textbox', { name: 'Message' });
        await user.type(field, 'hi');

        expect(field).toHaveAttribute('id', 'message');
        expect(field).toHaveAttribute('rows', '6');
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(ref.current).toBe(field);
    });
});
