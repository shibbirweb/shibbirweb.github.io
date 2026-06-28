import { JetBrains_Mono } from 'next/font/google';

// Shared so the monospace font is defined once and ships only on the pages that
// opt in by applying `jetBrainsMono.variable` (the single article page and the
// terminal-path breadcrumb), instead of loading globally from the root layout.
export const jetBrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
});
