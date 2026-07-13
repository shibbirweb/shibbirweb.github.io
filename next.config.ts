import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

// next dev runs a real Node server (Server Actions + node:fs available), while
// next build must stay a static export for GitHub Pages. So export is turned on
// only for production, and the .dev.tsx / .dev.ts extensions are treated as
// routes only in dev, keeping the dev-only editor and its server code out of the
// export build.
const isDev = process.env.NODE_ENV !== 'production';

// A fresh ISO timestamp per build, baked into the client and the version.json
// route so the running app can detect a newer deploy: the deployed build's
// builtAt is strictly later than the one baked into an older open tab. Git plays
// no part, so it works identically locally and in CI regardless of clone depth.
const buildTime = new Date().toISOString();

const nextConfig: NextConfig = {
    output: isDev ? undefined : 'export',
    pageExtensions: isDev
        ? ['tsx', 'ts', 'jsx', 'js', 'dev.tsx', 'dev.ts']
        : ['tsx', 'ts', 'jsx', 'js'],
    images: {
        loader: 'custom',
        // kept small: the only image is the ~224px headshot, so we never
        // need (or upscale to) large widths.
        imageSizes: [96, 128, 224, 256, 384],
        deviceSizes: [448, 640, 828],
    },
    transpilePackages: ['next-image-export-optimizer'],
    env: {
        nextImageExportOptimizer_imageFolderPath: 'public/images',
        nextImageExportOptimizer_exportFolderPath: 'out',
        nextImageExportOptimizer_quality: '75',
        nextImageExportOptimizer_storePicturesInWEBP: 'true',
        nextImageExportOptimizer_exportFolderName: 'nextImageExportOptimizer',
        nextImageExportOptimizer_generateAndUseBlurImages: 'true',
        nextImageExportOptimizer_remoteImageCacheTTL: '0',
        NEXT_PUBLIC_BUILD_TIME: buildTime,
    },
};

// Serwist compiles the service worker (src/app/sw.ts) into the export and is
// disabled in dev so it never fights turbopack HMR. Registration is manual (see
// ServiceWorkerManager) so the update toast can drive the waiting-worker swap.
const withSerwist = withSerwistInit({
    cacheOnNavigation: true,
    swSrc: 'src/app/sw.ts',
    swDest: 'public/sw.js',
    disable: isDev,
    register: false,
    reloadOnOnline: false,
    // Precache the home document so `/` is always available offline. Serwist
    // precaches the /_next build assets (the app shell) but not the exported HTML
    // pages (in this static export they are not globbed), and the runtime
    // navigation cache is wiped on every update (see clearRuntimeCaches in
    // useServiceWorker), so without this the home page drops out of the offline
    // cache after an update until it is revisited. The precache survives updates,
    // so the shell plus this entry keep `/` fully interactive offline.
    //
    // Appended via manifestTransforms (not additionalPrecacheEntries, which in
    // this @serwist/next version replaces the whole globbed manifest and drops
    // the public assets + offline-fallback.html). The transform runs on the final
    // URLs, so it just adds `/`, de-duping in case a future export ever globs
    // index.html. `buildTime` changes every build, so the entry re-caches on each
    // deploy; `/` always exists, so it never 404s. Cross-build install 404s from
    // the hashed shell assets are prevented by updateViaCache 'none' on the client
    // (always fetch a fresh, in-step sw.js).
    manifestTransforms: [
        (entries) => ({
            manifest: [
                ...entries.filter((entry) => entry.url !== '/'),
                { url: '/', revision: buildTime, size: 0 },
            ],
            warnings: [],
        }),
    ],
});

export default withSerwist(nextConfig);
