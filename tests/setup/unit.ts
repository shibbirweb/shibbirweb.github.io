import { afterEach, vi } from 'vitest';

// Unit tests must never reach the network (gist embeds, contact provider).
// A test that needs fetch stubs it itself with vi.stubGlobal('fetch', ...).
afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});
