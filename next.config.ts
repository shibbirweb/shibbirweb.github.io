import type { NextConfig } from 'next';

// next dev runs a real Node server (Server Actions + node:fs available), while
// next build must stay a static export for GitHub Pages. So export is turned on
// only for production, and the .dev.tsx / .dev.ts extensions are treated as
// routes only in dev, keeping the dev-only editor and its server code out of the
// export build.
const isDev = process.env.NODE_ENV !== 'production';

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
    },
};

export default nextConfig;
