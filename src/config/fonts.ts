import { Noto_Sans, Zain } from 'next/font/google';

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

// JetBrains Mono is intentionally NOT defined here. It lives in its own module
// (@/config/monoFont) so importing this file from the root layout and the home
// hero does not pull the monospace font onto every route. See that file for why.
