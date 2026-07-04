import type { Metadata } from 'next';

import ArticleEditor from '@/components/pages/article-editor/ArticleEditor';

// Dev-only route: the .dev.tsx extension is recognized as a page only in dev
// (see pageExtensions in next.config.ts), so this never enters the export build.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

// The editor renders its live preview client-side (useMarkdownPreview). Step 7
// turns this into an async Server Component that reads the filesystem
// (listArticles / getSuggestions) and threads the data into <ArticleEditor />.
export default function ArticleEditorPage() {
    return <ArticleEditor />;
}
