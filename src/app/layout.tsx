import type { Metadata, Viewport } from 'next';
import { Zain } from 'next/font/google';
import './globals.css';
import {
    facebookPageId,
    googleTagManagerId,
    siteAuthor,
    siteDescription,
    siteKeywords,
    siteLocale,
    siteName,
    siteThumbnail,
    siteURL,
    twitterUsername,
} from '@/config/constants';
import { GoogleTagManager } from '@next/third-parties/google';
import { JsonLdScriptComponent } from '@/components/utils/JsonLdScriptComponent';

const zainSansSerif = Zain({
    variable: '--font-zain-sans-serif',
    subsets: ['latin'],
    weight: ['400', '700'],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteURL),
    title: {
        default: siteAuthor,
        template: '%s | ' + siteAuthor,
    },
    description: siteDescription,
    openGraph: {
        title: siteName,
        description: siteDescription,
        url: siteURL,
        siteName: siteName,
        locale: siteLocale,
        type: 'website',
        images: '/opengraph-image.png',
    },
    twitter: {
        card: 'summary_large_image',
        title: siteName,
        description: siteDescription,
        creator: twitterUsername,
        siteId: twitterUsername,
    },
    keywords: siteKeywords,
    authors: [
        {
            name: siteAuthor,
            url: siteURL,
        },
    ],
    creator: siteAuthor,
    applicationName: siteName,
    publisher: siteAuthor,
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/shibbir-logo-192x192.png',
        apple: '/shibbir-logo-192x192.png',
        shortcut: '/shibbir-logo-192x192.png',
    },
    manifest: '/manifest.json',
    category: 'portfolio',
    facebook: {
        admins: [facebookPageId],
    },
    pinterest: {
        richPin: true,
    },
    other: {
        thumbnail: siteThumbnail,
    },
};

export const viewport: Viewport = {
    themeColor: 'white',
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
                <meta
                    name="apple-mobile-web-app-title"
                    content={siteName}
                />
                <meta
                    property="fb:pages"
                    content={facebookPageId}
                ></meta>
                {process.env.NODE_ENV === 'production' ? (
                    <JsonLdScriptComponent />
                ) : null}
            </head>
            {process.env.NODE_ENV === 'production' && (
                <GoogleTagManager gtmId={googleTagManagerId} />
            )}
            <body
                className={`${zainSansSerif.variable} bg-background flex min-h-svh flex-col text-3xl antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
