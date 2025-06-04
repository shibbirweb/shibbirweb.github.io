import { siteURL } from '@/config/constants';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    publicRuntimeConfig: {
        siteURL: siteURL,
        sitemapURL: `${siteURL}/sitemap.xml`,
    },
};

export default nextConfig;
