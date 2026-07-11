import http from 'node:http';
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { extname, join } from 'node:path';

// Serves the static export in ./out for local preview, mimicking GitHub Pages:
// for an extensionless path it tries the file, then `${path}.html`, then
// `${path}/index.html`. This matters because the exported routes are `.html`
// files and the service worker precaches extensionless URLs; a naive static
// server would 404 on both. Pass --https to serve over TLS with a locally
// trusted localhost certificate (the same mkcert-based cert `next dev
// --experimental-https` uses, so the browser shows no "not secure" warning).
// Pass --port <n> to override the port.

const args = process.argv.slice(2);
const useHttps = args.includes('--https');
const portFlagIndex = args.indexOf('--port');
const port =
    portFlagIndex !== -1
        ? Number(args[portFlagIndex + 1])
        : useHttps
          ? 4322
          : 4321;
const host = 'localhost';

const root = join(process.cwd(), 'out');

const contentTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.pdf': 'application/pdf',
};

async function resolveFile(pathname: string): Promise<string | null> {
    const decoded = decodeURIComponent(pathname);
    const base = join(root, decoded);
    const candidates =
        extname(decoded) !== ''
            ? [base]
            : [base, `${base}.html`, join(base, 'index.html')];
    for (const file of candidates) {
        try {
            if ((await stat(file)).isFile()) return file;
        } catch {
            // try the next candidate
        }
    }
    return null;
}

const handler: http.RequestListener = async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${host}:${port}`);
    const requested = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = await resolveFile(requested);
    if (!file) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const notFound = await readFile(join(root, '404.html')).catch(
            () => 'Not found'
        );
        res.end(notFound);
        return;
    }
    res.setHeader(
        'Content-Type',
        contentTypes[extname(file)] ?? 'application/octet-stream'
    );
    // version.json must never be cached, matching the client's no-store poll.
    if (file.endsWith('version.json')) res.setHeader('Cache-Control', 'no-store');
    res.end(await readFile(file));
};

const certDir = join(process.cwd(), 'certificates');
const keyPath = join(certDir, 'localhost-key.pem');
const certPath = join(certDir, 'localhost.pem');

/** The mkcert binary Next caches under $XDG_CACHE_HOME/mkcert (or ~/.cache). */
async function findMkcertBinary(): Promise<string | null> {
    const cacheRoot = process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache');
    const dir = join(cacheRoot, 'mkcert');
    try {
        const entry = (await readdir(dir)).find((name) =>
            name.startsWith('mkcert-')
        );
        return entry ? join(dir, entry) : null;
    } catch {
        return null;
    }
}

/** The mkcert CA directory (holds rootCA.pem), for the trust hint. */
async function getCaRoot(): Promise<string> {
    const mkcert = await findMkcertBinary();
    if (mkcert) {
        try {
            return execFileSync(mkcert, ['-CAROOT']).toString().trim();
        } catch {
            // fall through to the default location
        }
    }
    return join(
        process.env.XDG_DATA_HOME ?? join(homedir(), '.local/share'),
        'mkcert'
    );
}

/**
 * On Linux, browsers read the NSS trust store, not the system store, so the CA
 * that `mkcert -install` adds is only picked up automatically when `certutil`
 * (libnss3-tools) is present. When it is not, the browser shows "not secure"
 * until the CA is trusted once. Printed on every https start so the fix is
 * always at hand; harmless once the CA is already trusted.
 */
async function printTrustHint(): Promise<void> {
    const caRoot = await getCaRoot();
    console.log(
        `\nIf the browser shows "not secure", trust the local CA once (no sudo):\n` +
            `  import "${join(caRoot, 'rootCA.pem')}" as a trusted Authority\n` +
            '  Chrome:  Settings > Privacy and security > Security > Manage ' +
            'certificates > Authorities > Import (tick "trust for identifying ' +
            'websites")\n' +
            '  Firefox: Settings > Privacy & Security > Certificates > View ' +
            'Certificates > Authorities > Import\n' +
            '  Or, to trust it system/browser-wide automatically: install ' +
            'libnss3-tools, then rerun.\n'
    );
}

/**
 * A locally trusted localhost cert, using the same mkcert flow as
 * `next dev --experimental-https`.
 *
 * First it tries Next's `createSelfSignedCertificate`, which downloads mkcert,
 * runs `mkcert -install` (trusting the local CA), and issues the cert. When the
 * CA install cannot complete (e.g. no sudo, or `libnss3-tools`/`certutil` absent
 * so mkcert cannot reach the browser trust store), Next returns undefined; we
 * then generate a CA-signed cert directly with the now-cached mkcert binary
 * WITHOUT `-install`, so HTTPS still serves. The cert is valid and chains to the
 * mkcert CA, so the browser trusts it once that CA is trusted (see the printed
 * hint). This deep Next import is not a public API but is fine for a dev-only
 * preview script.
 */
async function getCert(): Promise<{ key: Buffer; cert: Buffer }> {
    const { createSelfSignedCertificate } = await import(
        'next/dist/lib/mkcert'
    );
    const trusted = await createSelfSignedCertificate(host).catch(
        () => undefined
    );
    if (trusted) {
        return {
            key: await readFile(trusted.key),
            cert: await readFile(trusted.cert),
        };
    }

    // Fallback: the CA is not installed in a trust store, but mkcert is cached
    // (the attempt above downloads it). Issue a cert without touching any trust
    // store so the server still runs.
    const mkcert = await findMkcertBinary();
    if (!mkcert) {
        console.error(
            '\nCould not obtain the mkcert binary. Run `pnpm dev:https` once (it ' +
                'downloads mkcert), or use `pnpm preview` over http://localhost.'
        );
        process.exit(1);
    }
    await mkdir(certDir, { recursive: true });
    execFileSync(
        mkcert,
        ['-cert-file', certPath, '-key-file', keyPath, host, '127.0.0.1', '::1'],
        { stdio: 'ignore' }
    );
    return {
        key: await readFile(keyPath),
        cert: await readFile(certPath),
    };
}

async function main() {
    if (!existsSync(root)) {
        console.error('No ./out folder found. Run `pnpm build` first.');
        process.exit(1);
    }

    const scheme = useHttps ? 'https' : 'http';
    const onListening = () =>
        console.log(`Serving ./out at ${scheme}://${host}:${port}`);

    if (useHttps) {
        const { key, cert } = await getCert();
        https.createServer({ key, cert }, handler).listen(port, onListening);
        await printTrustHint();
    } else {
        http.createServer(handler).listen(port, onListening);
    }
}

void main();
