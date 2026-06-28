import { JetBrains_Mono, Noto_Sans, Zain } from 'next/font/google';

// Noto Sans is the site's default body font (applied globally in the root
// layout). It is a neutral, standard-proportioned sans, so type sizes read at
// conventional portfolio scales rather than the tall display look of Zain.
export const notoSans = Noto_Sans({
    variable: '--font-noto-sans',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

// Zain is the display font, scoped to the home hero (the large name + title)
// by applying `zain.variable` there, so it ships only on the home page.
export const zain = Zain({
    variable: '--font-zain-sans-serif',
    subsets: ['latin'],
    weight: ['400', '700'],
});

// Shared so the monospace font is defined once and ships only on the pages that
// opt in by applying `jetBrainsMono.variable` (the single article page and the
// terminal-path breadcrumb), instead of loading globally from the root layout.
export const jetBrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
});
