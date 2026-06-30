import type { NextConfig } from 'next';

// The production deployment is a static export to GitHub Pages, so server
// features (API routes, dynamic rendering) are unavailable there. The dev-only
// Article Studio (see src/components/admin) relies on exactly those features, so
// we keep them out of production two ways that reinforce each other:
//
//   1. `output: 'export'` is only set for the production build, so `next dev`
//      runs a full server where the Studio's API routes and file writes work.
//   2. Studio routes use the `.dev.tsx` / `.dev.ts` file suffix, which is only
//      registered as a routable extension in development. In a production build
//      those files are invisible to the router, so no admin page or API handler
//      is ever compiled into (or could break) the static export.
const isProduction = process.env.NODE_ENV === 'production';
const basePageExtensions = ['tsx', 'ts', 'jsx', 'js'];

const nextConfig: NextConfig = {
    ...(isProduction ? { output: 'export' as const } : {}),
    pageExtensions: isProduction
        ? basePageExtensions
        : ['dev.tsx', 'dev.ts', ...basePageExtensions],
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
    },
};

export default nextConfig;
