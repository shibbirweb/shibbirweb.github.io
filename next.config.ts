import type { NextConfig } from 'next';
import { execSync } from 'node:child_process';
import withSerwistInit from '@serwist/next';

// next dev runs a real Node server (Server Actions + node:fs available), while
// next build must stay a static export for GitHub Pages. So export is turned on
// only for production, and the .dev.tsx / .dev.ts extensions are treated as
// routes only in dev, keeping the dev-only editor and its server code out of the
// export build.
const isDev = process.env.NODE_ENV !== 'production';

// The build version is a monotonically increasing integer: the git commit count,
// which advances on every commit (and therefore every deploy) with no state file
// and works identically locally and in CI. It is baked into the client and the
// version.json route so the running app can detect a newer deploy. Falls back to
// a timestamp when git is unavailable.
function computeBuildVersion(): string {
    try {
        return execSync('git rev-list --count HEAD').toString().trim();
    } catch {
        return String(Date.now());
    }
}
const buildVersion = computeBuildVersion();
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
        NEXT_PUBLIC_BUILD_VERSION: buildVersion,
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
});

export default withSerwist(nextConfig);
