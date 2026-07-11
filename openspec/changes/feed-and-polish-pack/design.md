## Context

The site is a Next.js (App Router) portfolio, statically exported (`output: 'export'`) to GitHub Pages at `https://shibbir.me`. There is no runtime server in production: no API routes, no dynamic rendering. Metadata routes (`sitemap.ts`, `robots.ts`, `manifest.ts`) already work by being statically resolvable at build. Articles are markdown in `content/articles/*.md`, parsed by `src/lib/posts.ts` and rendered to HTML by `src/lib/markdown.ts` (Shiki, Mermaid, footnotes, alerts, emoji). All personal/site data lives in `src/config/constants.ts`.

This change adds subscribe feeds and branded error pages. Everything must resolve statically at build time.

## Goals / Non-Goals

**Goals:**

- Ship RSS 2.0, Atom 1.0, and JSON Feed 1.1, each as a static file written into `out/` by the export.
- Full rendered article HTML in each feed item, reusing the existing markdown pipeline (no second renderer).
- Feed autodiscovery links in the site head.
- Branded 404 (`out/404.html`) and a client error boundary.
- Zero new runtime dependencies; no hardcoded personal data (read `constants.ts`).

**Non-Goals:**

- Per-post view counts, comments, or newsletter capture (need an external service; out of scope).
- Paginated or partial feeds; the corpus is tiny, so a single full feed per format is fine.
- A `loading.tsx` (no benefit for fully static SSG output).
- Feed images beyond the article cover/OG raster the sitemap already exposes.

## Decisions

### Route handlers with `dynamic = 'force-static'` for feeds

Each feed is a Route Handler (`src/app/<name>/route.ts`) exporting `const dynamic = 'force-static'` and a `GET` returning a `Response` with the correct `Content-Type`. Under `output: 'export'` these are emitted as static files (`out/feed.xml`, etc.), matching how `sitemap.ts`/`robots.ts` already behave. Alternative considered: a build script writing files into `public/`; rejected because route handlers keep the logic inside the app, are type-checked, and follow the existing metadata-route pattern.

### Shared builder `src/lib/feed.ts`, three thin serializers

One module assembles the feed model once (channel metadata + ordered items with absolute URLs, dates, and full HTML); each route handler only serializes that model into its format. This avoids three copies of article-loading and URL/date logic. Full HTML is loaded via the existing `getArticle(slug)` (which runs `buildArticle` through the same pipeline as article pages); the ordered list comes from `getAllArticles()`.

### Full-content feeds

Feed items carry the full rendered article HTML (`content:encoded` / Atom `content type="html"` / JSON `content_html`). Chosen over summary-only so subscribers can read offline; the corpus is small so feed size is a non-issue. The HTML is first-party and already sanitization-exempt per the markdown module's documented contract.

### XML escaping and CDATA

A small escaping helper handles XML text nodes (`&`, `<`, `>`, quotes) for titles/descriptions; full HTML bodies are wrapped in CDATA to avoid entity-escaping an entire document. JSON output relies on `JSON.stringify`.

### Dates

Frontmatter stores `date`/`updated` as `YYYY-MM-DD`. Parse as `new Date(\`${value}T00:00:00\`)` (same approach as `sitemap.ts`), then format RFC-822 for RSS and RFC-3339 for Atom/JSON.

### Feed discovery via root metadata

Add `alternates.types` to the root `metadata` in `layout.tsx` (Next emits the `<link rel="alternate">` tags). Keeps discovery declarative and colocated with the rest of the site metadata. An optional footer RSS link is left to implementation discretion.

### Branded 404 and error via app-router conventions

`src/app/not-found.tsx` (server component) exports to `out/404.html`, which GitHub Pages serves for unknown paths. `src/app/error.tsx` (`'use client'`, `{ error, reset }`) is the client error boundary. Both stay thin and lean on existing `src/components/` primitives (`SectionHeading`, `cn`), honoring the rule that `src/app/` holds routing only; if markup grows, extract a shared component into `src/components/`.

## Risks / Trade-offs

- **Feeds require absolute URLs; a relative link silently breaks readers** -> Centralize URL building in `src/lib/feed.ts` off `siteURL`; verify absolute URLs during the build-output eyeball check.
- **Malformed XML fails silently in some readers** -> Validate `out/feed.xml` and `out/atom.xml` with `xmllint --noout` and optionally the W3C Feed Validator before publishing.
- **Full HTML in feeds can include site-relative asset paths** -> Ensure image/link resolution produces absolute URLs (reuse the sitemap's cover/OG raster logic).
- **`error.tsx` has limited reach on a static site** (it catches client render errors, not HTTP status pages) -> Accepted; the branded 404 covers the common unknown-path case.
- **Empty corpus** (currently one article, could be zero) -> Builder emits valid empty feeds rather than throwing, mirroring the sitemap's empty-articles guard.

## Migration Plan

Additive only. New files plus one metadata addition in `layout.tsx`; no existing behavior changes and no data migration. Rollback is deleting the new files and reverting the `layout.tsx` metadata edit. Deploy via the normal `master` -> Pages build.
