import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
    loadPage,
    outExists,
    readOut,
    readOutBuffer,
} from '@tests/build/helpers';

interface Manifest {
    name: string;
    short_name: string;
    start_url: string;
    display: string;
    icons: { src: string; sizes: string; purpose?: string }[];
    screenshots: { src: string }[];
}

describe('web app manifest', () => {
    const manifest = JSON.parse(readOut('manifest.webmanifest')) as Manifest;

    it('is installable as a standalone app starting at /', () => {
        expect(manifest.name).toBeTruthy();
        expect(manifest.short_name).toBeTruthy();
        expect(manifest.start_url).toBe('/');
        expect(manifest.display).toBe('standalone');
    });

    it('has 192px and 512px icons, including maskable ones', () => {
        const sizes = manifest.icons.map((icon) => icon.sizes);

        expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
        expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(
            true
        );
    });

    it('references icons and screenshots that exist', () => {
        for (const asset of [...manifest.icons, ...manifest.screenshots]) {
            expect(outExists(asset.src.slice(1)), asset.src).toBe(true);
        }
    });
});

describe('service worker precache', () => {
    const serviceWorker = readOut('sw.js');

    function precacheRevision(url: string): string | null {
        const pattern = new RegExp(
            `'revision':'([^']+)','url':'${url.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}'`
        );
        return serviceWorker.match(pattern)?.[1] ?? null;
    }

    it('precaches the home page with the build time as its revision', () => {
        const { builtAt } = JSON.parse(readOut('version.json')) as {
            builtAt: string;
        };

        expect(precacheRevision('/')).toBe(builtAt);
    });

    it('precaches the offline fallback with the hash of the final file', () => {
        const hash = createHash('md5')
            .update(readOutBuffer('offline-fallback.html'))
            .digest('hex');

        expect(precacheRevision('/offline-fallback.html')).toBe(hash);
    });

    it('precaches the app shell from /_next/static', () => {
        expect(serviceWorker).toMatch(/'url':'\/_next\/static\//);
    });

    it('does not precache the dev-only studio', () => {
        expect(serviceWorker).not.toContain('/studio');
    });
});

describe('offline fallback page', () => {
    const document = loadPage('offline-fallback.html');

    it('is a snapshot of the network status page', () => {
        expect(document.querySelector('[data-network-root]')).not.toBeNull();
        expect(
            document
                .querySelector('meta[name="robots"]')
                ?.getAttribute('content')
        ).toContain('noindex');
    });

    it('loads no Next.js scripts and inlines its styles', () => {
        const externalScripts = document.querySelectorAll('script[src]');
        const externalStyles = document.querySelectorAll(
            'link[rel="stylesheet"]'
        );

        expect(externalScripts).toHaveLength(0);
        expect(externalStyles).toHaveLength(0);
        expect(document.querySelectorAll('style').length).toBeGreaterThan(0);
    });

    it('keeps only the theme script and the reconnect script', () => {
        const inlineScripts = [...document.querySelectorAll('script')].map(
            (script) => script.textContent ?? ''
        );

        expect(inlineScripts).toHaveLength(2);
        expect(inlineScripts.join('\n')).toContain('/version.json');
    });
});
