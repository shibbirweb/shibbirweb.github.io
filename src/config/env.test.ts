import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
});

async function loadFlags(nodeEnvironment: string) {
    vi.stubEnv('NODE_ENV', nodeEnvironment);
    vi.resetModules();
    return import('@/config/env');
}

describe('environment flags', () => {
    it('reports production for a production build', async () => {
        const flags = await loadFlags('production');
        expect(flags.isProduction).toBe(true);
        expect(flags.isDevelopment).toBe(false);
    });

    it('reports development outside production', async () => {
        const flags = await loadFlags('development');
        expect(flags.isProduction).toBe(false);
        expect(flags.isDevelopment).toBe(true);
    });

    it('treats the test environment as non-production', async () => {
        const flags = await loadFlags('test');
        expect(flags.isProduction).toBe(false);
        expect(flags.isDevelopment).toBe(true);
    });
});
