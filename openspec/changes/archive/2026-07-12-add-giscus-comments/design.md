## Context

The site is a statically exported Next.js app (`output: 'export'`) served on GitHub Pages, so there is no server runtime to host or moderate comments. Article bodies are pre-rendered Markdown HTML (`Article.html`) injected by the server component `ArticleContent`, then progressively upgraded by client "island" components (`MermaidRenderer`, `CodeBlockCopy`, `ImageLightbox`, `ReadingProgress`, `TableOfContents`) that run in the browser after hydration.

giscus fits this model: it is a client-only iframe widget loaded from `giscus.app/client.js` that stores comments in GitHub Discussions. It needs no server, no npm dependency, and no build step. The site already resolves an explicit theme to `<html data-theme>` and exposes `getResolvedTheme()` + `subscribe()` from `@/components/layout/ThemeToggle/theme`; `MermaidRenderer` already uses these to re-theme a third-party widget, giving a proven pattern to copy.

## Goals / Non-Goals

**Goals:**
- Render a giscus comment thread under every `/articles/<slug>` page.
- Map threads by URL `pathname` so no per-article wiring is needed.
- Keep the giscus theme in lockstep with the site theme, live, without reload.
- Keep all embed parameters in `src/config/constants.ts` (single source of truth).
- Preserve the static export: no server runtime, no new npm dependency.

**Non-Goals:**
- No custom comment UI, moderation dashboard, or self-hosted storage (GitHub Discussions owns that).
- No comments on the `/articles` index, tag pages, `/now`, `/uses`, or the home teaser.
- No SSR/prerender of comments; the widget is client-only by nature.
- No `NODE_ENV` gating; the widget renders in dev and prod (a confirmed decision), unlike GTM/JSON-LD/service worker.

## Decisions

### Client island component, injected via `useEffect`
A new `'use client'` component `src/components/pages/articles/Comments/` renders an empty container `<div ref>`; a colocated `hooks/useGiscus.ts` performs the side effect (per project rule, effects live in a named `useXxx` hook). The hook builds a `<script src="https://giscus.app/client.js">` element, sets the `data-*` attributes, and appends it to the container ref, mirroring the recommended giscus embed. It clears the container on cleanup so React re-mounts (or fast-refresh) do not double-inject.

Alternative considered: `next/script`. Rejected because the codebase deliberately avoids `next/script` (its `afterInteractive`/`lazyOnload` strategies do not behave the same under static export, and there is zero existing usage). The manual `useEffect` injection matches `MermaidRenderer`'s dynamic-import island approach and keeps behavior identical in dev and prod.

### Mapping by `pathname`
`data-mapping="pathname"` binds each thread to the article URL with no per-page term. Alternatives: `specific` term = `article.slug` (more explicit, survives URL restructures, but requires threading the slug through to the client component) and `og:title` (fragile: editing a title orphans the thread). `pathname` is the giscus default and the least-config option; article slugs/paths are already stable, so it is the right trade-off. This was confirmed with the maintainer.

### Live theme sync via `postMessage`
Initial `data-theme` comes from `getResolvedTheme()` (`dark` -> giscus `dark`, otherwise `light`). For live updates, `subscribe(listener)` fires on manual toggle, cross-tab change, and OS scheme flip; the listener posts `{ giscus: { setConfig: { theme } } }` to the giscus iframe (`container.querySelector('iframe.giscus-frame')?.contentWindow`, target origin `https://giscus.app`). This is exactly the initial-set + `subscribe`-reapply shape in `useMermaidSvg` (`:30`, `:43`), but giscus updates in place through `postMessage` rather than a re-render, so no reload is needed.

### Config in `src/config/constants.ts`
Add `giscusRepo`, `giscusRepoId`, `giscusCategory`, `giscusCategoryId` as `export const`s next to `googleTagManagerId` / `facebookPageId`. These are public embed values (they ship in the client HTML), so committing them is fine. `giscusRepoId` and `giscusCategoryId` are opaque node IDs that can only be obtained from https://giscus.app after enabling Discussions and installing the giscus GitHub App, so they start as empty-string placeholders with an explaining comment. The component reads all four from constants and never hardcodes them.

### Placement
`<Comments />` goes in the article content column (the `min-w-0` div) directly after `<ArticlePager />` in `ArticleView/index.tsx`, so comments sit at reading width below the body/nav and above the related-articles aside. `ArticleView` stays a server component; `<Comments>` is a client-island sibling of `MermaidRenderer` / `CodeBlockCopy` / `ImageLightbox`, so the dev editor's full-page preview renders it too.

### Performance
Use `data-loading="lazy"` so giscus fetches the iframe only as it scrolls into view, keeping it off the initial article render cost.

## Risks / Trade-offs

- Third-party runtime dependency on `giscus.app` and GitHub Discussions -> if either is down, the widget fails to load; the article itself is unaffected because comments are an isolated island appended after content.
- Rendering in dev/prod means local comment submissions post to the real repo Discussions -> mitigation: reviewers avoid submitting from local dev; the pathname is the same string regardless of origin, so no separate test threads are created by merely loading.
- Empty `giscusRepoId` / `giscusCategoryId` -> giscus renders a visible configuration error instead of a thread. Mitigation: the constants carry a comment pointing to https://giscus.app, and the tasks include a manual pre-req step; verification requires real IDs before the widget works.
- Privacy: loads a cross-origin iframe and, once a reader signs in, their GitHub identity and comments live in the repo's Discussions. This is inherent to giscus and acceptable for a personal blog.
- Static export unaffected: no API route, Server Action, middleware, or ISR is introduced; the only additions are client-side.
