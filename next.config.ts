import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'export',
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
