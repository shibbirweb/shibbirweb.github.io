import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import {
    facebookPageId,
    googleTagManagerId,
    jsonLdAlternateName,
    personFamilyName,
    personGivenName,
    professionalTitle,
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
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import HashScroll from '@/components/layout/HashScroll';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageGradientBackground from '@/components/backgrounds/PageGradientBackground';
import { hasArticles } from '@/lib/posts';
import { hasResume } from '@/lib/resume';
import { notoSans } from '@/config/fonts';

export const metadata: Metadata = {
    metadataBase: new URL(siteURL),
    alternates: {
        canonical: '/',
    },
    title: {
        default: `${siteAuthor} | ${professionalTitle}`,
        template: '%s | ' + siteAuthor,
    },
    description: siteDescription,
    openGraph: {
        title: siteName,
        description: siteDescription,
        url: siteURL,
        siteName: siteName,
        locale: siteLocale,
        type: 'profile',
        firstName: personGivenName,
        lastName: personFamilyName,
        username: jsonLdAlternateName,
        images: '/opengraph-image.png',
    },
    twitter: {
        card: 'summary_large_image',
        title: siteName,
        description: siteDescription,
        creator: twitterUsername,
        siteId: twitterUsername,
        images: '/opengraph-image.png',
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
                    <JsonLdScript />
                ) : null}
            </head>
            {process.env.NODE_ENV === 'production' && (
                <GoogleTagManager gtmId={googleTagManagerId} />
            )}
            <body
                className={`${notoSans.variable} bg-background relative flex min-h-svh flex-col text-base antialiased`}
            >
                <PageGradientBackground />
                <HashScroll />
                <Navbar
                    hasArticles={hasArticles()}
                    hasResume={hasResume()}
                    adminEnabled={process.env.NODE_ENV !== 'production'}
                />
                <div className="flex grow flex-col">{children}</div>
                <Footer />
            </body>
        </html>
    );
}
