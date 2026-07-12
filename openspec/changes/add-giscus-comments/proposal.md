## Why

Article pages (`/articles/[slug]`) offer no way for readers to respond, ask questions, or react. Adding [giscus](https://giscus.app), a GitHub Discussions backed comment widget, gives each article a discussion thread with zero moderation infrastructure to run and no personal data stored outside GitHub.

## What Changes

- Add a new client-side comment widget under every article body, powered by giscus (a pure client-side iframe embed loaded from `giscus.app/client.js`).
- Map each article to its GitHub Discussion by `pathname` (the `/articles/<slug>/` URL), so no per-article configuration is required.
- Sync the giscus theme live to the site theme (light/dark) via the existing `ThemeToggle` `getResolvedTheme` + `subscribe` module, mirroring how `MermaidRenderer` re-themes.
- Store the giscus embed parameters (`giscusRepo`, `giscusRepoId`, `giscusCategory`, `giscusCategoryId`) in `src/config/constants.ts` as the single source of truth; components read them, never hardcode them.
- The widget renders in dev and production (not gated on `NODE_ENV`), so placement and theming can be verified locally.

Static-export impact: none of this needs a server runtime. giscus is a client-only iframe loaded at view time, so it is fully compatible with `output: 'export'`. No API route, Server Action, middleware, or build-time data source is introduced.

## Capabilities

### New Capabilities
- `article-comments`: reader discussion under each article, provided by an embedded giscus widget mapped by URL pathname, themed in sync with the site, and configured from `src/config/constants.ts`.

### Modified Capabilities
<!-- None. No existing spec's requirements change. -->

## Impact

- New config: `src/config/constants.ts` gains `giscusRepo`, `giscusRepoId`, `giscusCategory`, `giscusCategoryId`. `giscusRepoId` and `giscusCategoryId` are not guessable and must be generated at https://giscus.app after enabling GitHub Discussions and installing the giscus GitHub App.
- New component: `src/components/pages/articles/Comments/` (a `'use client'` island plus a `hooks/useGiscus.ts`).
- Modified: `src/components/pages/articles/ArticleView/index.tsx` renders `<Comments />` in the article content column, below `ArticlePager`.
- Reuses: `src/components/layout/ThemeToggle/theme.ts` (`getResolvedTheme`, `subscribe`).
- No new npm dependency (giscus loads its own script from its CDN). External runtime dependency on `giscus.app` and GitHub Discussions availability.
- Privacy: the widget loads a third-party iframe from `giscus.app`; comment content and identity live in GitHub Discussions on the repo.
