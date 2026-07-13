// Post-build: snapshot the exported `/offline` route (out/offline.html) into a
// self-contained static file (out/offline-fallback.html) and point the service
// worker's navigation fallback at it.
//
// Why a snapshot rather than serving the route directly: the service worker
// serves the fallback under whatever unvisited URL the user opened. A hydrated
// Next document served there re-runs the client router, matches no route, and
// renders not-found, clobbering the offline page. Stripping every script leaves
// the prerendered markup (navbar, footer, theme colours) with no hydration and
// no router, so it is safe at any URL. The stylesheet is inlined and there are
// no `<img>`/external assets, so the page renders fully offline even though the
// content-hashed /_next output is intentionally kept out of the precache.
//
// Runs last in `pnpm build`, after `out/` and `out/sw.js` exist.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { THEME_STORAGE_KEY } from '@/components/layout/ThemeToggle/theme';

const OUT = path.join(process.cwd(), 'out');
const SOURCE = path.join(OUT, 'offline.html');
const DESTINATION = path.join(OUT, 'offline-fallback.html');
const SERVICE_WORKER = path.join(OUT, 'sw.js');
const FALLBACK_URL = '/offline-fallback.html';

// Mirrors ThemeScript.tsx: apply the saved light/dark choice before first paint
// so the snapshot honours it even without hydration. Re-added after all scripts
// are stripped below.
const themePrePaintScript = `<script>(function(){try{var p=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY
)});var t=(p==='light'||p==='dark')?p:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var d=document.documentElement;d.setAttribute('data-theme',t);d.style.colorScheme=t;}catch(e){}})();</script>`;

// Keep the one interactive affordance that is cheap without hydration: reload.
const tryAgainScript = `<script>document.addEventListener('click',function(e){var t=e.target.closest('[data-offline-reload]');if(t){e.preventDefault();location.reload();}});</script>`;

function inlineStylesheet(tag: string): string {
    const href = tag.match(/href="([^"]+)"/)?.[1];
    if (!href || !href.startsWith('/_next/')) return tag;
    const cssPath = path.join(OUT, href.replace(/^\//, ''));
    if (!fs.existsSync(cssPath)) return tag;
    return `<style>${fs.readFileSync(cssPath, 'utf8')}</style>`;
}

function main(): void {
    if (!fs.existsSync(SOURCE)) {
        throw new Error(
            `generate-offline-fallback: ${SOURCE} not found (run after next build).`
        );
    }

    let html = fs.readFileSync(SOURCE, 'utf8');

    // 1. Drop all scripts (Next hydration chunks + inline flight data + jsonld):
    //    no hydration means no router, so the snapshot is router-fallback safe.
    html = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<script\b[^>]*\/>/gi, '');

    // 2. Drop /_next preloads (their targets are not precached; offline they only
    //    log 404 noise), then inline the same-origin stylesheets so the page is
    //    fully self-contained.
    html = html
        .replace(/<link\b[^>]*rel="preload"[^>]*>/gi, '')
        .replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi, inlineStylesheet);

    // 3. Re-add the pre-paint theme script and the reload handler.
    html = html.replace(
        '</head>',
        `${themePrePaintScript}${tryAgainScript}</head>`
    );

    fs.writeFileSync(DESTINATION, html);

    // 4. Point the precache revision at the generated file so a redeploy that
    //    changes the snapshot busts the cached copy. The entry already exists in
    //    the manifest because public/offline-fallback.html is a public asset.
    const revision = createHash('md5').update(html).digest('hex');
    const serviceWorker = fs.readFileSync(SERVICE_WORKER, 'utf8');
    const pattern = new RegExp(
        `('revision':')[a-f0-9]+(','url':'${FALLBACK_URL.replace(/\//g, '\\/')}')`
    );
    if (!pattern.test(serviceWorker)) {
        throw new Error(
            `generate-offline-fallback: precache entry for ${FALLBACK_URL} not found in sw.js.`
        );
    }
    fs.writeFileSync(
        SERVICE_WORKER,
        serviceWorker.replace(pattern, `$1${revision}$2`)
    );

    const sizeKb = Math.round(html.length / 1024);
    console.log(
        `generate-offline-fallback: wrote ${DESTINATION} (${sizeKb}KB), precache revision ${revision}`
    );
}

main();
