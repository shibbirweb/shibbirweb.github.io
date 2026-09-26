import { describe, expect, it, vi } from 'vitest';
import { siteAuthor } from '@/config/constants';
import { createWeb3FormsProvider } from '@/lib/contact/providers/web3forms';
import type { ContactMessage } from '@/lib/contact/types';

const MESSAGE: ContactMessage = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Hello there.',
    captchaToken: 'captcha-token-123',
};

const GENERIC_ERROR =
    'Something went wrong sending your message. Please try again.';
const NETWORK_ERROR =
    'Network error. Please check your connection and try again.';

/** Stub fetch with a response whose json() resolves to `body` (or rejects). */
function stubFetchResponse(ok: boolean, body: unknown, jsonFails = false) {
    const fetchMock = vi.fn<typeof fetch>(
        async () =>
            ({
                ok,
                json: async () => {
                    if (jsonFails) {
                        throw new SyntaxError('Unexpected token');
                    }
                    return body;
                },
            }) as Response
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

/** The parsed JSON body of the first fetch call. */
function sentPayload(
    fetchMock: ReturnType<typeof stubFetchResponse>
): Record<string, unknown> {
    const [, init] = fetchMock.mock.calls[0];
    return JSON.parse(String(init?.body));
}

describe('createWeb3FormsProvider', () => {
    it('identifies itself as web3forms', () => {
        expect(createWeb3FormsProvider({ accessKey: 'key' }).id).toBe(
            'web3forms'
        );
    });

    it('POSTs JSON to the Web3Forms submit endpoint', async () => {
        const fetchMock = stubFetchResponse(true, { success: true });

        await createWeb3FormsProvider({ accessKey: 'key' }).submit(MESSAGE);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://api.web3forms.com/submit');
        expect(init?.method).toBe('POST');
        expect(init?.headers).toEqual({
            'Content-Type': 'application/json',
            Accept: 'application/json',
        });
    });

    it('sends the access key, message fields, subject, and captcha token', async () => {
        const fetchMock = stubFetchResponse(true, { success: true });

        await createWeb3FormsProvider({ accessKey: 'secret-key' }).submit(
            MESSAGE
        );

        expect(sentPayload(fetchMock)).toEqual({
            access_key: 'secret-key',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            message: 'Hello there.',
            from_name: 'Ada Lovelace',
            subject: `New message from Ada Lovelace via ${siteAuthor}`,
            'h-captcha-response': 'captcha-token-123',
        });
    });

    it('omits h-captcha-response when there is no captcha token', async () => {
        const fetchMock = stubFetchResponse(true, { success: true });

        await createWeb3FormsProvider({ accessKey: 'key' }).submit({
            ...MESSAGE,
            captchaToken: null,
        });

        expect(sentPayload(fetchMock)).not.toHaveProperty('h-captcha-response');
    });

    it('succeeds only when the response is ok and reports success', async () => {
        stubFetchResponse(true, { success: true });

        await expect(
            createWeb3FormsProvider({ accessKey: 'key' }).submit(MESSAGE)
        ).resolves.toEqual({ ok: true });
    });

    it('fails when the response is ok but success is false, passing the server message through', async () => {
        stubFetchResponse(true, {
            success: false,
            message: 'Invalid access key',
        });

        await expect(
            createWeb3FormsProvider({ accessKey: 'key' }).submit(MESSAGE)
        ).resolves.toEqual({ ok: false, error: 'Invalid access key' });
    });

    it('fails when the HTTP status is not ok even if the body claims success', async () => {
        stubFetchResponse(false, { success: true, message: 'Rate limited' });

        await expect(
            createWeb3FormsProvider({ accessKey: 'key' }).submit(MESSAGE)
        ).resolves.toEqual({ ok: false, error: 'Rate limited' });
    });

    it('uses a generic message when the server gives none', async () => {
        stubFetchResponse(false, { success: false });

        await expect(
            createWeb3FormsProvider({ accessKey: 'key' }).submit(MESSAGE)
        ).resolves.toEqual({ ok: false, error: GENERIC_ERROR });
    });

    it('uses a generic message when the response body is not JSON', async () => {
        stubFetchResponse(false, null, true);

        await expect(
            createWeb3FormsProvider({ accessKey: 'key' }).submit(MESSAGE)
        ).resolves.toEqual({ ok: false, error: GENERIC_ERROR });
    });

    it('reports a network error when the request itself fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new TypeError('Failed to fetch');
            })
        );

        await expect(
            createWeb3FormsProvider({ accessKey: 'key' }).submit(MESSAGE)
        ).resolves.toEqual({ ok: false, error: NETWORK_ERROR });
    });
});
