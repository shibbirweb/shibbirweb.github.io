import type { Metadata } from 'next';
import { /* Geist_Mono, */ Zain } from 'next/font/google';
import './globals.css';

const zainSansSerif = Zain({
    variable: '--font-zain-sans-serif',
    subsets: ['latin'],
    weight: ['400', '700'],
});

/* const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
}); */

export const metadata: Metadata = {
    title: 'Shibbir Ahmed',
    description: "Shibbir Ahmed's Portfolio",
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
                    href="/icons/icon-192x192.png"
                />
                <meta
                    name="theme-color"
                    content="#ffffff"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content="Shibbir Ahmed"
                />
            </head>
            <body
                className={`${zainSansSerif.variable} bg-background flex min-h-[100svh] flex-col antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
