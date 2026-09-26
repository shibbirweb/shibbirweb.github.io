import { existsSync } from 'node:fs';
import { join } from 'node:path';

// The build suite inspects the static export, so fail fast with a clear
// message instead of a wall of "file not found" assertions.
if (!existsSync(join(process.cwd(), 'out', 'index.html'))) {
    throw new Error(
        'No static export found in ./out. Run `pnpm build` before `pnpm test:build`.'
    );
}
