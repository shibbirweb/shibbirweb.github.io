import { StudioError } from '@/lib/admin/articleStore';

/**
 * Shared plumbing for the Article Studio's dev-only route handlers: a single
 * place that enforces the dev-only guard, turns thrown `StudioError`s into the
 * right HTTP status, and keeps every handler a one-line delegation to the store.
 */
export async function handle(
    run: () => Promise<unknown> | unknown
): Promise<Response> {
    // The route files are excluded from production builds, but guard anyway so
    // the Studio API can never respond outside development.
    if (process.env.NODE_ENV === 'production') {
        return Response.json({ error: 'Not found' }, { status: 404 });
    }
    try {
        const data = await run();
        return Response.json(data ?? { ok: true });
    } catch (error) {
        const status = error instanceof StudioError ? error.status : 500;
        const message =
            error instanceof Error ? error.message : 'Unexpected error';
        if (status >= 500) console.error('[Article Studio]', error);
        return Response.json({ error: message }, { status });
    }
}

/** Parse a JSON body, tolerating an empty one. */
export async function readJson<T = Record<string, unknown>>(
    request: Request
): Promise<T> {
    try {
        return (await request.json()) as T;
    } catch {
        return {} as T;
    }
}

/** Read a required query parameter or throw a 400. */
export function requireParam(request: Request, name: string): string {
    const value = new URL(request.url).searchParams.get(name);
    if (!value) throw new StudioError(`Missing "${name}" parameter`);
    return value;
}
