import { JetBrains_Mono } from 'next/font/google';

// JetBrains Mono lives in its OWN module, separate from fonts.ts, so it ships
// only on the pages that import it (the terminal-path breadcrumb and the article
// detail page). next/font preloads every font co-instantiated in an imported
// module, and fonts.ts is pulled into every route through the root layout
// (notoSans) and the home hero (zain). Keeping the monospace font out of fonts.ts
// is what actually keeps it off the home page and other routes that do not opt
// in by applying `jetBrainsMono.variable`.
export const jetBrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
});
