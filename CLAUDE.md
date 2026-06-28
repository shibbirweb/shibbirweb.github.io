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

`next.config.ts` sets `output: 'export'`, so the entire site is pre-rendered to static HTML/assets in `./out`. This rules out runtime server features: no API routes, no Server Actions, no `next/image` optimization loader, no middleware, no ISR/dynamic rendering. Metadata routes (`sitemap.ts`, `robots.ts`) must stay statically resolvable, so they use `export const dynamic = 'force-static'`.

Site-wide config (URLs for `siteURL`, sitemap) is exposed through `publicRuntimeConfig` in `next.config.ts` and read in `sitemap.ts`/`robots.ts` via `getConfig()` from `next/config`. Most other code imports values directly from `@/config/constants`.

### Single source of truth: `src/config/constants.ts`

**All** personal data, URLs, SEO keywords, job/education info, and social links live here. When changing site content (name, title, description, links, schema data), edit this file first, since `layout.tsx` metadata, `utils/jsonLd.ts`, and section components all consume it. Avoid hardcoding any of this data inside components.

### Page composition

`src/app/page.tsx` composes the home page sections (inside a single `<main>`), each a PascalCase folder with an `index.tsx` under `src/components/pages/home/`:

- `HeroArea/`: name + title + social icons over an animated grid background; scroll-down cue links to `#about`
- `AboutMeArea/`: heading, photo, bio, experience/education (anchor `#about`)
- `ProjectsArea/`: "Featured Projects" card grid driven by `contents.ts` (anchor `#work`)
- `SkillsArea/`: grouped skill tags driven by `contents.ts` (anchor `#skills`)
- `ArticlesArea/`: "Latest Articles" teaser of the most recent posts (anchor `#articles`)
- `ContactArea/`: mailto CTA + reused `SocialIcons` (anchor `#contact`)

Section folders carry their own component-wise `contents.ts` (e.g. `HeroArea/contents.ts` holds `socialLinks`; `ProjectsArea/contents.ts` holds the curated project list). Page-wise data that a route's `page.tsx` owns stays beside the route instead (e.g. `src/app/now/contents.ts`, `src/app/uses/contents.ts`), with its shared types extracted to a `types.ts` in the component folder so `src/components/` never imports from `src/app/`. Shared/reusable pieces live in `src/components/` (`animations/`, `backgrounds/`, `icons/`, `layout/`, `seo/`, `wrappers/`, plus `pages/` for page-grouped sections with `pages/common/` for cross-section primitives). Section headings use the shared `SectionHeading` (`src/components/pages/common/SectionHeading.tsx`), the underline-accent motif. Anchor IDs (`#about`, `#work`, `#skills`, `#articles`, `#contact`) work with the `scroll-smooth` set on `<html>`.

### Component conventions

- Prefer small, single-responsibility, reusable components. Do **not** put multiple components (or large inline JSX blocks) in one file; extract repeated markup (cards, tags, list rows, links) into their own components. When a component grows large or juggles several concerns, **split it into smaller subcomponents** rather than letting it become a monolith.
- Cross-section/shared UI primitives live in `src/components/pages/common/` (e.g. `SectionHeading`, `Tag`). Section-specific subcomponents are colocated in the section folder next to its `contents.ts` (e.g. `ProjectsArea/ProjectCard.tsx`, `ProjectsArea/ProjectLink.tsx`, `SkillsArea/SkillGroup.tsx`).
- Keep each section's `index.tsx` thin: section wrapper + `SectionHeading` + a `.map()` over a subcomponent. Data lives in `contents.ts`, not inline.
- Reuse the shared `cn()` helper and existing primitives before creating new ones; avoid premature abstraction for genuinely one-off markup.
- A component that spans more than one file (e.g. a co-located CSS Module, subcomponents, or its own `contents.ts`) gets its **own folder** with the entry point as `index.tsx` and its files beside it, e.g. `components/animations/AnimatedUnderline/index.tsx` + `AnimatedUnderline.module.css`. Keep genuinely single-file components as a single `.tsx`.
- Put stateful and side-effecting logic (`useEffect`, IntersectionObservers, event listeners, disclosure/toggle state) in **named custom hooks** (`useXxx`) instead of inlining it in components. Colocate them in a `hooks/` folder beside the component (e.g. `components/layout/Navbar/hooks/useScrollSpy.ts`) and keep generic ones (`useDisclosure`, `useCloseOnEscape`, `useScrollSpy`) reusable. A component should read top-down: call hooks, then return JSX.

### Imports & file placement

- **Use the `@/` alias for every import; never use a relative path (`./` or `../`)**, not even for a same-folder sibling (e.g. `import ProjectCard from '@/components/pages/home/ProjectsArea/ProjectCard'`, not `'./ProjectCard'`). CSS Module and asset imports follow the same rule. This includes the root layout's global stylesheet (`import '@/app/globals.css'` in `src/app/layout.tsx`); plain `*.css` side-effect imports resolve via the ambient `declare module '*.css'` in `src/types/css.d.ts`.
- **`src/app/` holds only routing concerns**: `page.tsx`, `layout.tsx`, metadata routes (`sitemap.ts`, `robots.ts`, `manifest.ts`), `globals.css`, and route icons/images. **Never define a component in `src/app/`**; all components live in `src/components/`.
- **Group components by purpose, never in a catch-all bucket**: `animations/`, `backgrounds/`, `icons/`, `layout/`, `seo/`, `wrappers/`, and `pages/` (section components grouped by route, with `pages/common/` for cross-section primitives). `src/utils/` is for **pure helper functions only** (e.g. `cn`, `formatDate`); never put a component there.
- **`src/components/` must never import from `src/app/`** (dependencies flow `app -> components` only). Data a route's `page.tsx` owns is page-wise and lives beside the route as `src/app/<route>/contents.ts`; data a self-contained component owns is component-wise and lives in a `contents.ts` inside that component's folder. When page-wise data and its components share types, put the types in a `types.ts` in the component folder and import them from both sides.

### Naming conventions

- Names must be **readable in context**: prefer clarity over brevity. A variable, function, prop, or CSS custom property should convey what it holds without the reader having to trace its declaration.
- Avoid cryptic abbreviations and one/two-letter identifiers (e.g. `--au-c`, `d`, `tmp`); spell out the intent (`underlineColor`, `delayMs`, `sectionRef`).
- Short, idiomatic names are still fine where they are unambiguous: a loop `i`, the shared `cn()` helper, a mapped `item`/`group`.
- This applies project-wide, to **TypeScript identifiers and CSS variable/class names alike**.
- **Directories**: grouping/category folders are lowercase (`animations/`, `icons/`, `layout/`, `pages/`); a folder that *is* one component is PascalCase and matches its exported component (`HeroArea/`, `Navbar/`, `ArticleContent/`).
- Do not suffix a component with `Component` (redundant under `src/components/`): name it `GridBackground`, not `GridBackgroundComponent`.

### Copy & punctuation

- **Never use the em dash (`—`) character** anywhere in the project: not in UI copy, code, comments, JSON-LD/metadata strings, README, or this file. Rephrase instead with a comma, colon, parentheses, or a separate sentence; for title or name separators use a pipe (`|`).

### Commit conventions

- Do **not** add Claude/AI co-author trailers (`Co-Authored-By: Claude …`) or other AI attribution to commits or PRs. This is enforced by `attribution: { "commit": "", "pr": "" }` in `.claude/settings.json` (project-level, so it travels with the repo).

### Git workflow

- **Do not commit without explicit approval.** Apply changes to the working tree and let the maintainer review them first; only run `git commit` when explicitly asked to.
- **Never commit directly to `master` (the default branch).** When a commit is approved, create a new branch first (`feat/...`, `fix/...`, `chore/...` as appropriate) and commit there. `master` only advances through merged pull requests, so if you are on `master` when asked to commit, branch first, then commit.
- **Do not push or open PRs.** The maintainer pushes their own branches and opens pull requests; do not run `git push` (or create/merge PRs) unless explicitly asked to.

### SEO & structured data

This is a major focus of the codebase. `layout.tsx` defines the full Next.js `Metadata` (OpenGraph, Twitter, robots, icons, manifest). `src/utils/jsonLd.ts` builds a `schema.org` `ProfilePage`/`Person` JSON-LD object (typed with `schema-dts`), rendered via `JsonLdScript` (in `src/components/seo/`). **Both JSON-LD injection and Google Tag Manager are gated on `process.env.NODE_ENV === 'production'`** (see `layout.tsx`), so they do not appear in dev.

### Styling (Tailwind v4)

CSS-first configuration lives in `src/app/globals.css`; there is **no `tailwind.config.js`**. Theme tokens, custom keyframes (`shine`), and custom utilities (`text-box-trim-*`, `text-box-edge-*`) are declared with `@theme` / `@utility` directives. Dark mode is driven by `prefers-color-scheme` (system), not a class toggle. Use the `cn()` helper (`@/utils/cn`, wraps `clsx` + `tailwind-merge`) for conditional class composition. Respect `motion-safe:` prefixes on animations.

Path alias: `@/*` -> `./src/*`.

### Deployment

`.github/workflows/deploy.yml` runs on push to `master`: pnpm install -> `pnpm build` -> upload `./out` -> deploy to GitHub Pages. The build receives `PAGES_BASE_PATH`, but note `next.config.ts` does **not** currently consume it into `basePath`, and the site works because it serves from a custom domain at root. If the deploy target ever changes to a subpath, wire `basePath`/`assetPrefix` into `next.config.ts`.
