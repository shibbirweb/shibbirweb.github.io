import { siteAuthor } from '@/config/constants';
import type {
    ContactMessage,
    ContactProvider,
    ContactSubmitResult,
} from '@/lib/contact/types';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

type Web3FormsConfig = {
    accessKey: string;
};

type Web3FormsResponse = {
    success: boolean;
    message?: string;
};

/**
 * Web3Forms implementation of the ContactProvider contract. Posts the message
 * as JSON to the Web3Forms endpoint; no backend of ours is involved, which
 * suits the static export. The hCaptcha token (when present) is forwarded as
 * `h-captcha-response`, the field Web3Forms expects for spam verification.
 */
export function createWeb3FormsProvider({
    accessKey,
}: Web3FormsConfig): ContactProvider {
    return {
        id: 'web3forms',
        async submit(message: ContactMessage): Promise<ContactSubmitResult> {
            try {
                const response = await fetch(WEB3FORMS_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        access_key: accessKey,
                        name: message.name,
                        email: message.email,
                        message: message.message,
                        from_name: message.name,
                        subject: `New message from ${message.name} via ${siteAuthor}`,
                        'h-captcha-response': message.captchaToken ?? undefined,
                    }),
                });

                const data = (await response
                    .json()
                    .catch(() => null)) as Web3FormsResponse | null;

                if (response.ok && data?.success) {
                    return { ok: true };
                }

                return {
                    ok: false,
                    error:
                        data?.message ??
                        'Something went wrong sending your message. Please try again.',
                };
            } catch {
                return {
                    ok: false,
                    error: 'Network error. Please check your connection and try again.',
                };
            }
        },
    };
}
