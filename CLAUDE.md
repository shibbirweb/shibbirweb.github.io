# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page personal portfolio for Shibbir Ahmed, built with Next.js 15 (App Router) and Tailwind CSS v4, **statically exported** and deployed to GitHub Pages under the custom domain `https://shibbir.me`.

## Commands

Package manager is **pnpm** (v10). Node 22 in CI.

```bash
pnpm dev          # Dev server with Turbopack
pnpm dev:https     # Dev server over HTTPS (for testing OG/PWA features)
pnpm build         # Production build -> static export into ./out
pnpm lint          # next lint (ESLint 9 + prettier config)
pnpm start         # Serve a non-exported build (rarely used here)
```

There is **no test suite** and no test runner configured.

## Architecture

### Static export constraints
`next.config.ts` sets `output: 'export'`, so the entire site is pre-rendered to static HTML/assets in `./out`. This rules out runtime server features: no API routes, no Server Actions, no `next/image` optimization loader, no middleware, no ISR/dynamic rendering. Metadata routes (`sitemap.ts`, `robots.ts`) must stay statically resolvable — they use `export const dynamic = 'force-static'`.

Site-wide config (URLs for `siteURL`, sitemap) is exposed through `publicRuntimeConfig` in `next.config.ts` and read in `sitemap.ts`/`robots.ts` via `getConfig()` from `next/config`. Most other code imports values directly from `@/config/constants`.

### Single source of truth: `src/config/constants.ts`
**All** personal data, URLs, SEO keywords, job/education info, and social links live here. When changing site content (name, title, description, links, schema data), edit this file first — `layout.tsx` metadata, `utils/jsonLd.ts`, and section components all consume it. Avoid hardcoding any of this data inside components.

### Page composition
`src/app/page.tsx` composes the page sections (inside a single `<main>`), each a folder under `src/app/_root/` (the `_` prefix makes it a route-excluded colocation directory):
- `hero-area/` — name + title + social icons over an animated grid background; scroll-down cue links to `#about`
- `about-me-area/` — heading, photo, bio, experience/education (anchor `#about`)
- `projects-area/` — "Featured Projects" card grid driven by `contents.ts` (anchor `#work`)
- `skills-area/` — grouped skill tags driven by `contents.ts` (anchor `#skills`)
- `contact-area/` — mailto CTA + reused `SocialIcons` (anchor `#contact`)
- `footer-area/` — bottom SVG logo

Section folders may carry their own `contents.ts` (e.g. `hero-area/contents.ts` holds `socialLinks`; `projects-area/contents.ts` holds the curated project list). Shared/reusable pieces live in `src/components/` (`animations/`, `icons/`, `utils/`, `wrappers/`, `pages/common/`). Section headings use the shared `SectionHeading` (`src/components/pages/common/SectionHeading.tsx`) — the underline-accent motif. Anchor IDs (`#about`, `#work`, `#skills`, `#contact`) work with the `scroll-smooth` set on `<html>`.

### Component conventions

- Prefer small, single-responsibility, reusable components. Do **not** put multiple components — or large inline JSX blocks — in one file; extract repeated markup (cards, tags, list rows, links) into their own components.
- Cross-section/shared UI primitives live in `src/components/pages/common/` (e.g. `SectionHeading`, `Tag`). Section-specific subcomponents are colocated in the section folder next to its `contents.ts` (e.g. `projects-area/ProjectCard.tsx`, `projects-area/ProjectLink.tsx`, `skills-area/SkillGroup.tsx`).
- Keep each section's `index.tsx` thin: section wrapper + `SectionHeading` + a `.map()` over a subcomponent. Data lives in `contents.ts`, not inline.
- Reuse the shared `cn()` helper and existing primitives before creating new ones; avoid premature abstraction for genuinely one-off markup.
- A component that spans more than one file (e.g. a co-located CSS Module, subcomponents, or its own `contents.ts`) gets its **own folder** with the entry point as `index.tsx` and its files beside it — e.g. `components/animations/AnimatedUnderline/index.tsx` + `AnimatedUnderline.module.css`. Keep genuinely single-file components as a single `.tsx`.

### Naming conventions

- Names must be **readable in context** — prefer clarity over brevity. A variable, function, prop, or CSS custom property should convey what it holds without the reader having to trace its declaration.
- Avoid cryptic abbreviations and one/two-letter identifiers (e.g. `--au-c`, `d`, `tmp`); spell out the intent (`underlineColor`, `delayMs`, `sectionRef`).
- Short, idiomatic names are still fine where they are unambiguous: a loop `i`, the shared `cn()` helper, a mapped `item`/`group`.
- This applies project-wide — **TypeScript identifiers and CSS variable/class names alike**.

### Commit conventions

- Do **not** add Claude/AI co-author trailers (`Co-Authored-By: Claude …`) or other AI attribution to commits or PRs. This is enforced by `attribution: { "commit": "", "pr": "" }` in `.claude/settings.json` (project-level, so it travels with the repo).

### SEO & structured data
This is a major focus of the codebase. `layout.tsx` defines the full Next.js `Metadata` (OpenGraph, Twitter, robots, icons, manifest). `src/utils/jsonLd.ts` builds a `schema.org` `ProfilePage`/`Person` JSON-LD object (typed with `schema-dts`), rendered via `JsonLdScriptComponent`. **Both JSON-LD injection and Google Tag Manager are gated on `process.env.NODE_ENV === 'production'`** (see `layout.tsx`) — they do not appear in dev.

### Styling (Tailwind v4)
CSS-first configuration lives in `src/app/globals.css` — there is **no `tailwind.config.js`**. Theme tokens, custom keyframes (`shine`), and custom utilities (`text-box-trim-*`, `text-box-edge-*`) are declared with `@theme` / `@utility` directives. Dark mode is driven by `prefers-color-scheme` (system), not a class toggle. Use the `cn()` helper (`@/utils/cn`, wraps `clsx` + `tailwind-merge`) for conditional class composition. Respect `motion-safe:` prefixes on animations.

Path alias: `@/*` -> `./src/*`.

### Deployment
`.github/workflows/deploy.yml` runs on push to `master`: pnpm install -> `pnpm build` -> upload `./out` -> deploy to GitHub Pages. The build receives `PAGES_BASE_PATH`, but note `next.config.ts` does **not** currently consume it into `basePath` — the site works because it serves from a custom domain at root. If the deploy target ever changes to a subpath, wire `basePath`/`assetPrefix` into `next.config.ts`.
