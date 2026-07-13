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
    // Keep content-hashed build output out of the precache. Every redeploy
    // replaces the entire /_next/static tree (buildId-scoped _ssgManifest.js /
    // _buildManifest.js, route chunks, css, fonts) with new hashes, so a client
    // installing a service worker whose manifest still lists a previous build's
    // assets hits 404s. Serwist precaching is all-or-nothing, so one 404 fails
    // the whole install (bad-precaching-response) and the new worker never takes
    // over. Precaching only deploy-stable public assets (offline-fallback.html,
    // icons, images) keeps install resilient across builds; the runtimeCaching
    // rules in src/app/sw.ts serve /_next assets on demand and tolerate 404s.
    manifestTransforms: [
        (entries) => ({
            manifest: entries.filter(
                (entry) => !entry.url.startsWith('/_next/static/')
            ),
            warnings: [],
        }),
    ],
});

export default withSerwist(nextConfig);
