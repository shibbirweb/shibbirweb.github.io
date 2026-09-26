import { describe, expect, it, vi } from 'vitest';
import { web3formsAccessKey } from '@/config/constants';
import { contactProvider } from '@/lib/contact';

describe('contactProvider', () => {
    it('is the Web3Forms provider', () => {
        expect(contactProvider.id).toBe('web3forms');
    });

    it('submits with the configured Web3Forms access key', async () => {
        const fetchMock = vi.fn(async () => ({
            ok: true,
            json: async () => ({ success: true }),
        }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await contactProvider.submit({
            name: 'Ada',
            email: 'ada@example.com',
            message: 'Hi',
            captchaToken: null,
        });

        expect(result).toEqual({ ok: true });
        const [, init] = fetchMock.mock.calls[0] as unknown as [
            string,
            RequestInit,
        ];
        expect(JSON.parse(init.body as string).access_key).toBe(
            web3formsAccessKey
        );
    });
});
