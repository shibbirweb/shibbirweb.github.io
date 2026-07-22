import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import {
    facebookPageId,
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
import DeferredGoogleTagManager from '@/components/analytics/DeferredGoogleTagManager';
import PageviewTracker from '@/components/analytics/PageviewTracker';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { JsonLd } from '@/components/seo/JsonLd';
import { websiteJsonLd, siteNavigationJsonLd } from '@/utils/siteJsonLd';
import { ThemeScript } from '@/components/layout/ThemeToggle/ThemeScript';
import HashScroll from '@/components/layout/HashScroll';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageGradientBackground from '@/components/backgrounds/PageGradientBackground';
import { PageGradientProvider } from '@/components/backgrounds/PageGradientBackground/PageGradientProvider';
import { hasArticles } from '@/lib/posts';
import ServiceWorkerManager from '@/components/pwa/ServiceWorkerManager';
import { notoSans } from '@/config/fonts';

export const metadata: Metadata = {
    metadataBase: new URL(siteURL),
    alternates: {
        canonical: '/',
        types: {
            'application/rss+xml': `${siteURL}/feed.xml`,
            'application/atom+xml': `${siteURL}/atom.xml`,
            'application/feed+json': `${siteURL}/feed.json`,
        },
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
    // Match the browser chrome to the resolved theme's background token instead
    // of a fixed white, so the mobile status bar stays on-theme in dark mode.
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ededed' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
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
            suppressHydrationWarning
        >
            <head>
                {/* Applies the saved theme before first paint (no flash). Must be
                    first in <head> and runs in every environment. */}
                <ThemeScript />
                <meta
                    name="apple-mobile-web-app-title"
                    content={siteName}
                />
                <meta
                    property="fb:pages"
                    content={facebookPageId}
                ></meta>
                {process.env.NODE_ENV === 'production' ? (
                    <>
                        <JsonLdScript />
                        <JsonLd data={websiteJsonLd} />
                        <JsonLd data={siteNavigationJsonLd} />
                    </>
                ) : null}
            </head>
            {process.env.NODE_ENV === 'production' && (
                <>
                    <DeferredGoogleTagManager />
                    <PageviewTracker />
                </>
            )}
            <body
                className={`${notoSans.variable} bg-background relative flex min-h-svh flex-col text-base antialiased print:bg-white!`}
            >
                {/* Skip link: the first focusable element, visually hidden until
                    focused, so keyboard and screen-reader users can bypass the
                    fixed nav and jump straight to each page's <main id="main">. */}
                <a
                    href="#main"
                    className="focus-ring sr-only focus:not-sr-only focus:bg-background focus:text-foreground focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg print:hidden"
                >
                    Skip to content
                </a>
                <PageGradientProvider>
                    <PageGradientBackground />
                    <HashScroll />
                    {/* Site chrome is hidden in print so pages (e.g. /resume)
                        save as a clean document. */}
                    <div className="print:hidden">
                        <Navbar hasArticles={hasArticles()} />
                    </div>
                    {/* ServiceWorkerManager is the last child so its sticky
                        update toast floats over content while scrolling, then
                        parks at this wrapper's bottom edge (top of the footer),
                        clear of the footer signature below. Prod only (same gate
                        as GTM/JSON-LD); a service worker would fight turbopack
                        HMR in dev. */}
                    <div className="flex grow flex-col">
                        {children}
                        {process.env.NODE_ENV === 'production' && (
                            <ServiceWorkerManager />
                        )}
                    </div>
                    <Footer />
                </PageGradientProvider>
            </body>
        </html>
    );
}
