import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactForm from '@/components/pages/home/ContactArea/ContactForm';
import { useHCaptcha } from '@/components/pages/home/ContactArea/hooks/useHCaptcha';
import { contactProvider } from '@/lib/contact';

vi.mock('@/components/pages/home/ContactArea/hooks/useHCaptcha', () => ({
    useHCaptcha: vi.fn(),
}));
vi.mock('@/lib/contact', () => ({
    contactProvider: { id: 'test', submit: vi.fn() },
}));

const mockedUseHCaptcha = vi.mocked(useHCaptcha);
const mockedSubmit = vi.mocked(contactProvider.submit);
const resetCaptcha = vi.fn();

function mockCaptcha({
    token = null,
    isWidgetRendered = false,
}: {
    token?: string | null;
    isWidgetRendered?: boolean;
} = {}) {
    mockedUseHCaptcha.mockReturnValue({
        setContainer: () => {},
        token,
        reset: resetCaptcha,
        isWidgetRendered,
    });
}

function getSendButton() {
    return screen.getByRole('button', { name: /Send message/ });
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByRole('textbox', { name: /^Name/ }), 'Ada');
    await user.type(
        screen.getByRole('textbox', { name: /^Email/ }),
        'ada@example.com'
    );
    await user.type(
        screen.getByRole('textbox', { name: /^Message/ }),
        'Hello there'
    );
}

describe('ContactForm', () => {
    beforeEach(() => {
        resetCaptcha.mockClear();
        mockedSubmit.mockReset();
        mockedUseHCaptcha.mockReset();
        mockCaptcha();
    });

    it('requires the name, email, and message fields', () => {
        render(<ContactForm />);

        expect(screen.getByRole('textbox', { name: /^Name/ })).toBeRequired();
        expect(screen.getByRole('textbox', { name: /^Email/ })).toBeRequired();
        expect(
            screen.getByRole('textbox', { name: /^Message/ })
        ).toBeRequired();
        expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveAttribute(
            'type',
            'email'
        );
    });

    it('keeps send disabled and explains why until the captcha is solved', () => {
        render(<ContactForm />);

        expect(getSendButton()).toBeDisabled();
        expect(
            screen.getByText('Complete the captcha to enable sending.')
        ).toBeInTheDocument();
    });

    it('holds the captcha script back until the reader engages', async () => {
        const user = userEvent.setup();
        render(<ContactForm />);
        expect(mockedUseHCaptcha).toHaveBeenLastCalledWith({
            shouldLoad: false,
        });

        await user.click(screen.getByRole('textbox', { name: /^Name/ }));

        expect(mockedUseHCaptcha).toHaveBeenLastCalledWith({
            shouldLoad: true,
        });
        expect(screen.getByText('Loading the captcha...')).toBeInTheDocument();
    });

    it('asks for the captcha again once the widget has rendered', () => {
        mockCaptcha({ isWidgetRendered: true });
        render(<ContactForm />);

        expect(
            screen.getByText('Complete the captcha to enable sending.')
        ).toBeInTheDocument();
        expect(screen.queryByText('Solve the captcha')).not.toBeInTheDocument();
    });

    it('enables send once a captcha token exists', () => {
        mockCaptcha({ token: 'captcha-token', isWidgetRendered: true });
        render(<ContactForm />);

        expect(getSendButton()).toBeEnabled();
        expect(
            screen.queryByText('Complete the captcha to enable sending.')
        ).not.toBeInTheDocument();
    });

    it('submits the values with the captcha token and shows the success panel', async () => {
        const user = userEvent.setup();
        mockedSubmit.mockResolvedValue({ ok: true });
        mockCaptcha({ token: 'captcha-token', isWidgetRendered: true });
        render(<ContactForm />);

        await fillForm(user);
        await user.click(getSendButton());

        expect(mockedSubmit).toHaveBeenCalledWith({
            name: 'Ada',
            email: 'ada@example.com',
            message: 'Hello there',
            captchaToken: 'captcha-token',
        });
        const success = await screen.findByRole('status');
        expect(success).toHaveTextContent('Message sent successfully');
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('resets the single-use captcha after a submit', async () => {
        const user = userEvent.setup();
        mockedSubmit.mockResolvedValue({ ok: true });
        mockCaptcha({ token: 'captcha-token', isWidgetRendered: true });
        render(<ContactForm />);

        await fillForm(user);
        await user.click(getSendButton());

        await waitFor(() => expect(resetCaptcha).toHaveBeenCalledTimes(1));
    });

    it('shows the button as sending while the request is in flight', async () => {
        const user = userEvent.setup();
        let finishSubmit: (result: { ok: boolean }) => void = () => {};
        mockedSubmit.mockReturnValue(
            new Promise((resolve) => {
                finishSubmit = resolve;
            })
        );
        mockCaptcha({ token: 'captcha-token', isWidgetRendered: true });
        render(<ContactForm />);

        await fillForm(user);
        await user.click(getSendButton());

        const sending = screen.getByRole('button', { name: 'Sending...' });
        expect(sending).toBeDisabled();
        expect(sending).toHaveAttribute('aria-busy', 'true');

        finishSubmit({ ok: true });
        expect(await screen.findByRole('status')).toBeInTheDocument();
    });

    it('shows the provider error in an alert and keeps the form', async () => {
        const user = userEvent.setup();
        mockedSubmit.mockResolvedValue({
            ok: false,
            error: 'The inbox is full.',
        });
        mockCaptcha({ token: 'captcha-token', isWidgetRendered: true });
        render(<ContactForm />);

        await fillForm(user);
        await user.click(getSendButton());

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'The inbox is full.'
        );
        expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue(
            'Ada'
        );
        expect(resetCaptcha).toHaveBeenCalledTimes(1);
    });

    it('falls back to a generic error when the provider gives none', async () => {
        const user = userEvent.setup();
        mockedSubmit.mockResolvedValue({ ok: false });
        mockCaptcha({ token: 'captcha-token', isWidgetRendered: true });
        render(<ContactForm />);

        await fillForm(user);
        await user.click(getSendButton());

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Something went wrong sending your message. Please try again.'
        );
    });

    it('clears the form and captcha with Send another', async () => {
        const user = userEvent.setup();
        mockedSubmit.mockResolvedValue({ ok: true });
        mockCaptcha({ token: 'captcha-token', isWidgetRendered: true });
        render(<ContactForm />);

        await fillForm(user);
        await user.click(getSendButton());
        await user.click(
            await screen.findByRole('button', { name: 'Send another' })
        );

        expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: /^Message/ })).toHaveValue(
            ''
        );
        expect(resetCaptcha).toHaveBeenCalledTimes(2);
    });

    it('offers a direct email fallback', () => {
        render(<ContactForm />);

        const emailLink = screen
            .getAllByRole('link')
            .find((link) => link.getAttribute('href')?.startsWith('mailto:'));
        expect(emailLink).toBeDefined();
    });
});
