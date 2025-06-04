import type { Metadata } from 'next';
import { Zain } from 'next/font/google';
import './globals.css';
import {
    facebookPageId,
    googleTagManagerId,
    siteURL,
} from '@/config/constants';
import { GoogleTagManager } from '@next/third-parties/google';

const zainSansSerif = Zain({
    variable: '--font-zain-sans-serif',
    subsets: ['latin'],
    weight: ['400', '700'],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteURL),
    title: {
        default: 'Shibbir Ahmed',
        template: '%s | Shibbir Ahmed',
    },
    description: "Shibbir Ahmed's Portfolio",
    openGraph: {
        title: 'Shibbir Ahmed',
        description: "Shibbir Ahmed's Portfolio",
        url: siteURL,
        siteName: 'Shibbir Ahmed',
        locale: 'en_US',
        type: 'website',
        images: '/opengraph-image.png',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Shibbir Ahmed',
        description: "Shibbir Ahmed's Portfolio",
        creator: '@shibbirweb',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className="scroll-smooth"
        >
            <head>
                <link
                    rel="manifest"
                    href="/manifest.json"
                />
                <link
                    rel="icon"
                    href="/shibbir-logo-192x192.png"
                />
                <meta
                    name="theme-color"
                    content="#ffffff"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content="Shibbir Ahmed"
                />
                <meta
                    property="fb:pages"
                    content={facebookPageId}
                ></meta>
            </head>
            <GoogleTagManager gtmId={googleTagManagerId} />
            <body
                className={`${zainSansSerif.variable} bg-background flex min-h-[100svh] flex-col antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
