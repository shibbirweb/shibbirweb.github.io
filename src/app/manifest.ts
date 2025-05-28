import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
// This is a static manifest file for the PWA (Progressive Web App) configuration.

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Shibbir Ahmed',
        short_name: 'Shibbir',
        description: "Shibbir Ahmed's Portfolio",
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        orientation: 'portrait',
        icons: [
            {
                src: '/shibbir-logo-144x144.png',
                sizes: '144x144',
                type: 'image/png',
            },
            {
                src: '/shibbir-logo-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/shibbir-logo-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        screenshots: [
            {
                src: '/screenshot-640x320.png',
                sizes: '640x320',
                type: 'image/png',
                form_factor: 'wide',
                label: 'Shibbir Ahmed Portfolio - Wide Screenshot',
            },
            {
                src: '/screenshot-637x911.png',
                sizes: '637x911',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'Shibbir Ahmed Portfolio - Narrow Screenshot',
            },
        ],
    };
}
