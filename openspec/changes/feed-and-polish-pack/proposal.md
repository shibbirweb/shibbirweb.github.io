## Why

The article engine is deep (Shiki, Mermaid, TOC, series, search, per-article OG images, JSON-LD) but has no subscribe path: readers and aggregators cannot follow the blog because there is no RSS/Atom/JSON feed. Separately, unknown or stale URLs land on unbranded Next.js default 404/error screens. Both are cheap, high-value fixes and both are fully compatible with the static export (`output: 'export'`).

## What Changes

- Add three subscribable feeds, generated at build time as static files: RSS 2.0 at `/feed.xml`, Atom 1.0 at `/atom.xml`, and JSON Feed 1.1 at `/feed.json`. Each lists every published article, newest first, with full rendered HTML content, absolute URLs, and correct publish/update dates.
- Add feed autodiscovery: `<link rel="alternate">` tags for all three feeds in the site head via the root metadata.
- Add a branded 404 page (`not-found.tsx`) that exports to `out/404.html`, which GitHub Pages serves for any unknown path.
- Add a branded client error boundary (`error.tsx`) for runtime render errors on the exported site.
- Feeds and error pages read channel/author data from `src/config/constants.ts` (no hardcoded personal data) and reuse the existing article pipeline (`getAllArticles`, `getArticle`).

## Capabilities

### New Capabilities

- `article-feeds`: Build-time RSS, Atom, and JSON feeds of published articles, plus feed autodiscovery links in the site head.
- `error-pages`: Branded 404 (not-found) page and client error boundary for the exported site.

### Modified Capabilities

<!-- None. No existing spec-level behavior changes; feed discovery is an additive metadata change. -->

## Impact

- New route handlers: `src/app/feed.xml/route.ts`, `src/app/atom.xml/route.ts`, `src/app/feed.json/route.ts` (each `dynamic = 'force-static'`).
- New shared builder: `src/lib/feed.ts`.
- New pages: `src/app/not-found.tsx`, `src/app/error.tsx`.
- Modified: `src/app/layout.tsx` (add `alternates.types` for feed autodiscovery).
- Reused unchanged: `getAllArticles` / `getArticle` (`src/lib/posts.ts`), `src/config/constants.ts`, cover/OG helpers (`src/utils/generateArticleCover`), `SectionHeading`, `cn`.
- No new dependencies. Build output gains `out/feed.xml`, `out/atom.xml`, `out/feed.json`, `out/404.html`.
