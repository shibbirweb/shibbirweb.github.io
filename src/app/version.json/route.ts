import { getBuiltAt } from '@/lib/version';

// Static export writes the response to out/version.json. The client polls it to
// learn when a newer build (a strictly later builtAt) has been deployed.
export const dynamic = 'force-static';

export function GET() {
    const body = JSON.stringify({
        builtAt: getBuiltAt(),
    });
    return new Response(body, {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
}
