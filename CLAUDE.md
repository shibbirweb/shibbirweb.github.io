# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page personal portfolio for Shibbir Ahmed, built with Next.js 16 (App Router) and Tailwind CSS v4, **statically exported** and deployed to GitHub Pages under the custom domain `https://shibbir.me`.

## Commands

Package manager is **pnpm** (v10). Node 22 in CI.

```bash
pnpm dev             # gen:assets, then dev server with Turbopack
pnpm dev:https       # Same, over HTTPS (for testing OG/PWA/giscus features)
pnpm build           # gen:assets + gen:og, next build --webpack, image optimizer, offline fallback -> ./out
pnpm preview         # Serve ./out like GitHub Pages (http://localhost:4321; preview:https on 4322)
pnpm preview:docker  # Serve ./out with nginx + a locally trusted cert (docker-compose.yml)
pnpm lint            # eslint (ESLint 9 flat config + prettier); Next 16 removed `next lint`
pnpm typecheck       # next typegen + tsc --noEmit (covers tests too; next build type-checks them)
pnpm format          # prettier --write . (format:check to verify)
pnpm test            # Vitest unit + component tests (no build needed)
pnpm test:build      # Vitest checks against ./out (run pnpm build first)
pnpm test:e2e        # Playwright browser tests against ./out (test:e2e:install once)
pnpm test:lighthouse # Lighthouse CI score floors against ./out
pnpm test:ci         # everything, in CI order
pnpm start           # Serve a non-exported build (rarely used here)
```

`gen:assets` runs `gen:covers` (article cover SVGs), `gen:resume` (copies a private resume PDF if present) and `gen:giscus` (comment theme CSS from `globals.css`); `gen:og` rasterizes article OG PNGs and runs in `build` only. `build` uses webpack because the Serwist service worker plugin needs it.

## Testing

Every pull request to `master` runs `.github/workflows/ci.yml`: lint + typecheck + formatting of changed files, unit/component tests, `pnpm build` + build checks, Playwright, and Lighthouse. A feature change is not done until its tests pass and new behavior has a test. Details and conventions are in `docs/wiki/Testing.md`.

**Every new feature and every update covers all the test layers, not just one.** For each change, go through the layers below (unit/component, content, build checks, Playwright, Lighthouse) and write or update the tests each one needs: logic and hooks get unit tests, components get component tests, data in `contents.ts` gets content checks, anything that must be true of the static export (markup that ships, SEO, budgets) gets a build check, visitor-facing behavior gets a Playwright spec, and anything that can move load performance is checked with Lighthouse. A layer may be skipped only when the change genuinely has nothing for it to verify, and the hand-off must say which layers were skipped and why. Before calling a change done, run every layer locally (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:build`, `pnpm test:e2e`, `pnpm test:lighthouse`, or `pnpm test:ci`), not only the tests that were touched.

- **Unit and component tests** (Vitest) are colocated: `Foo.ts` -> `Foo.test.ts` (Node), `Foo.tsx` -> `Foo.test.tsx` (jsdom, React Testing Library). Content-wide checks (article frontmatter, every mermaid/reactflow diagram parses, no em dash, wiki links, data files) live in `tests/content/`. Tests follow the same code rules as source (`@/` imports, or `@tests/` for test helpers).
- **Build checks** (`tests/build/`) inspect `./out`: routes, metadata/canonical/OG, JSON-LD, sitemap/robots, feeds, manifest and service worker precache, internal links, and performance budgets (initial JS/CSS/HTML gzip size, mermaid and React Flow staying lazy). Raise a budget only deliberately, in the same PR, with the reason.
- **Browser tests** (`tests/e2e/`, Playwright, Chromium) run on desktop, laptop, tablet and mobile sizes. Import `test` from `@tests/e2e/fixtures`: it blocks every third-party request (mock with `page.route`) and fails on uncaught page errors. Use `waitForHydration(page)`, never `networkidle`. New routes go in `tests/e2e/routes.ts` so the responsive and axe sweeps cover them.
- **Lighthouse** (`lighthouserc.cjs`) audits pages served by `pnpm preview`, which gzips like GitHub Pages.
- Formatting is checked only on files a PR changes, because many older files predate Prettier; format a file when you touch it.

## Architecture

### Static export constraints

`next.config.ts` sets `output: 'export'` for production builds, so the entire site is pre-rendered to static HTML/assets in `./out`. This rules out runtime server features in shipped code: no API routes, no Server Actions, no `next/image` optimization loader (images go through `next-image-export-optimizer` with a custom loader), no middleware, no ISR/dynamic rendering. Metadata and feed routes (`sitemap.ts`, `robots.ts`, `manifest.ts`, `feed.xml`, `atom.xml`, `feed.json`, `version.json`) must stay statically resolvable, so they use `export const dynamic = 'force-static'`.

The one exception is dev-only code: `pageExtensions` includes `dev.tsx`/`dev.ts` only when `NODE_ENV !== 'production'`, so files like `src/app/studio/article-editor/page.dev.tsx` and its `actions.dev.ts` Server Actions (which use `node:fs`) are routes under `next dev` and are excluded from the export. Gate dev-only UI on `isDevelopment` from `@/config/env` so the bundler strips it from production.

`sitemap.ts`, `robots.ts`, and all other code import site-wide values directly from `@/config/constants`; there is no `publicRuntimeConfig`. The build time stamp (`NEXT_PUBLIC_BUILD_TIME`, set in `next.config.ts`, read via `getBuiltAt()` in `src/lib/version.ts`) drives the PWA update check, sitemap/JSON-LD dates, and `careerExperience`.

### Single source of truth: `src/config/constants.ts`

**All** personal data, URLs, SEO keywords, job/education info, and social links live here. When changing site content (name, title, description, links, schema data), edit this file first, since `layout.tsx` metadata, `utils/jsonLd.ts`, and section components all consume it. Avoid hardcoding any of this data inside components.

### Page composition

`src/app/page.tsx` composes the home page sections, in this order (inside a single `<main className="home-sections">`, after `SectionUrlSync`), each a PascalCase folder with an `index.tsx` under `src/components/pages/home/`:

- `HeroArea/`: name + title + social icons over an animated grid background (anchor `#hero`)
- `AboutMeArea/`: portrait plus four facet cards; `SystemDiagram` on `lg`, `Bento` below (anchor `#about`)
- `SkillsArea/`: skill tiles (`SkillCard`) driven by `contents.ts` (anchor `#skills`)
- `ProjectsArea/`: "Open Source" card grids (packages with a "Show more" toggle, personal projects) driven by `contents.ts`, plus a `ResumeBridge` link (anchor `#work`)
- `ArticlesArea/`: "Latest Articles" teaser of the most recent posts; renders nothing when there are none (anchor `#articles`)
- `ContactArea/`: Web3Forms contact form with lazily loaded hCaptcha and a mailto fallback, plus reused `SocialIcons` (anchor `#contact`)

Section folders carry their own component-wise `contents.ts` (e.g. `HeroArea/contents.ts` holds `socialLinks`; `ProjectsArea/contents.ts` holds the curated project list). Page-wise data that a route's `page.tsx` owns stays beside the route instead (e.g. `src/app/now/contents.ts`, `src/app/uses/contents.ts`), with its shared types extracted to a `types.ts` in the component folder so `src/components/` never imports from `src/app/`. Shared/reusable pieces live in `src/components/` (`analytics/`, `animations/`, `backgrounds/`, `icons/`, `layout/`, `pwa/`, `seo/`, `ui/`, `wrappers/`, plus `pages/` for page-grouped sections with `pages/common/` for cross-section primitives). Section headings use the shared `SectionHeading` (`src/components/pages/common/SectionHeading.tsx`). Anchor IDs (`#about`, `#work`, `#skills`, `#articles`, `#contact`) work with the `scroll-smooth` set on `<html>`; `useScrollSpy` + `SectionUrlSync` keep the URL hash in step while scrolling, `HashScroll` handles a hash on first load, and `scrollSyncLock` stops the two from fighting during nav clicks. A new home section's id must be added to `homeSectionIds` in `Navbar/contents.ts`.

### Component conventions

- Prefer small, single-responsibility, reusable components. Do **not** put multiple components (or large inline JSX blocks) in one file; extract repeated markup (cards, tags, list rows, links) into their own components. When a component grows large or juggles several concerns, **split it into smaller subcomponents** rather than letting it become a monolith.
- Cross-section/shared UI primitives live in `src/components/pages/common/` (e.g. `SectionHeading`, `Tag`). Section-specific subcomponents are colocated in the section folder next to its `contents.ts` (e.g. `ProjectsArea/ProjectCard/`, `ProjectsArea/ProjectLink.tsx`, `SkillsArea/SkillCard/`).
- Keep each section's `index.tsx` thin: section wrapper + `SectionHeading` + a `.map()` over a subcomponent. Data lives in `contents.ts`, not inline.
- Reuse the shared `cn()` helper and existing primitives before creating new ones; avoid premature abstraction for genuinely one-off markup.
- A component that spans more than one file (e.g. a co-located CSS Module, subcomponents, or its own `contents.ts`) gets its **own folder** with the entry point as `index.tsx` and its files beside it, e.g. `components/animations/AnimatedUnderline/index.tsx` + `AnimatedUnderline.module.css`. Keep genuinely single-file components as a single `.tsx`.
- Put stateful and side-effecting logic (`useEffect`, IntersectionObservers, event listeners, disclosure/toggle state) in **named custom hooks** (`useXxx`) instead of inlining it in components. Colocate them in a `hooks/` folder beside the component (e.g. `components/layout/Navbar/hooks/useScrollSpy.ts`) and keep generic ones (`useDisclosure`, `useCloseOnEscape`, `useScrollSpy`) reusable. A component should read top-down: call hooks, then return JSX.
- **Never nest ternaries.** A single `condition ? a : b` is fine, including in JSX. Anything that would nest becomes a **named pure helper with early returns** (colocated beside the component, e.g. `FlowDiagram/captions.ts`), or a lookup keyed on the inputs. A nested ternary hides which branch actually runs, and reads worse with every case added. This applies to derived values and JSX alike; when the branches pick between whole elements, prefer separate components or an early `return`.

### Imports & file placement

- **Use the `@/` alias for every import; never use a relative path (`./` or `../`)**, not even for a same-folder sibling (e.g. `import ProjectCard from '@/components/pages/home/ProjectsArea/ProjectCard'`, not `'./ProjectCard'`). CSS Module and asset imports follow the same rule. This includes the root layout's global stylesheet (`import '@/app/globals.css'` in `src/app/layout.tsx`); plain `*.css` side-effect imports resolve via the ambient `declare module '*.css'` in `src/types/css.d.ts`.
- **`src/app/` holds only routing concerns**: `page.tsx`, `layout.tsx`, metadata routes (`sitemap.ts`, `robots.ts`, `manifest.ts`), `globals.css`, and route icons/images. **Never define a component in `src/app/`**; all components live in `src/components/`.
- **Group components by purpose, never in a catch-all bucket**: `analytics/`, `animations/`, `backgrounds/`, `icons/`, `layout/`, `pwa/`, `seo/`, `ui/`, `wrappers/`, and `pages/` (section components grouped by route, with `pages/common/` for cross-section primitives). `src/utils/` is for **pure helper functions only** (e.g. `cn`, `formatDate`); never put a component there.
- **`src/components/` must never import from `src/app/`** (dependencies flow `app -> components` only). Data a route's `page.tsx` owns is page-wise and lives beside the route as `src/app/<route>/contents.ts`; data a self-contained component owns is component-wise and lives in a `contents.ts` inside that component's folder. When page-wise data and its components share types, put the types in a `types.ts` in the component folder and import them from both sides.

### Naming conventions

- Names must be **readable in context**: prefer clarity over brevity. A variable, function, prop, or CSS custom property should convey what it holds without the reader having to trace its declaration.
- Avoid cryptic abbreviations and one/two-letter identifiers (e.g. `--au-c`, `d`, `tmp`); spell out the intent (`underlineColor`, `delayMs`, `sectionRef`).
- Short, idiomatic names are still fine where they are unambiguous: a loop `i`, the shared `cn()` helper, a mapped `item`/`group`.
- This applies project-wide, to **TypeScript identifiers and CSS variable/class names alike**.
- **Directories**: grouping/category folders are lowercase (`animations/`, `icons/`, `layout/`, `pages/`); a folder that _is_ one component is PascalCase and matches its exported component (`HeroArea/`, `Navbar/`, `ArticleContent/`).
- Do not suffix a component with `Component` (redundant under `src/components/`): name it `GridBackground`, not `GridBackgroundComponent`.

### Copy & punctuation

- **Never use the em dash (`—`) character** anywhere in the project: not in UI copy, code, comments, JSON-LD/metadata strings, README, or this file. Rephrase instead with a comma, colon, parentheses, or a separate sentence; for title or name separators use a pipe (`|`).

### Writing articles

Articles are `content/articles/NN-<slug>.md`, where `NN` is the next zero-padded ordering prefix (stripped for the URL). The frontmatter contract is `ArticleFrontmatter` in `src/lib/articleSchema.ts`, and the exact YAML house style (field order, single-quoted scalars, inline `tags`/`tech` arrays, 4-space-indented `learn` items, `draft` written only when true) is defined by `serializeArticle` in `src/utils/articleFile.ts`. The authoritative list of supported body features, with copy-pasteable snippets, is `src/components/pages/article-editor/ArticleEditor/WritingGuide/contents.ts`.

These posts are **first-person accounts of things that actually happened to the maintainer**, so the writing rules matter as much as the schema:

- **Never reuse another article's section pattern.** Headings must be derived from the specifics of the story being told (e.g. "A branch I cut without thinking", "Thursday evening, and the fix still was not in production"), not generic narrative labels lifted from an existing post ("The setup", "The mistake", "The investigation", "Final thoughts"). A real story that reads like a filled-in template defeats the point of telling it. Match the existing articles' **voice**, never their outline.
- **Do not invent the concrete details.** Dates, times of day, branch and table names, ticket IDs, team specifics: use what the maintainer actually reports. Where a detail is genuinely needed and not supplied, ask, or state plainly which placeholders were invented so they can be swapped.
- **No roadmap paragraph.** Do not open with "This article covers X, then Y, then Z"; that is a template tell. Get into the story.
- **Body conventions**: no H1 (the frontmatter `title` supplies it), `##` and `###` only (H4+ gets no anchor and no TOC entry), sentence-case headings with no trailing punctuation or emoji, `*` bullets with a bold lead-in phrase, `> **Note:**` / `> **Warning:**` callouts (the house style, in preference to the `> [!NOTE]` alert syntax), and code fences carrying a bare language.
- **Verify mermaid diagrams actually render.** A parse or validation error degrades silently to a plain `<pre>` fallback (see `MermaidRenderer/hooks/useMermaidSvg.ts`), so a diagram that "looks fine" in the source may be broken on the page. Render it and look, do not assume.
- After adding an article, run `pnpm gen:covers` (auto-generates the cover SVG when `cover` is omitted), `pnpm test` (the content suite validates the frontmatter and parses every diagram), and `pnpm build`.

### Commit conventions

- Do **not** add Claude/AI co-author trailers (`Co-Authored-By: Claude …`) or other AI attribution to commits or PRs. This is enforced by `attribution: { "commit": "", "pr": "" }` in `.claude/settings.json` (project-level, so it travels with the repo).

### Git workflow

- **Do not commit without explicit approval.** Apply changes to the working tree and let the maintainer review them first; only run `git commit` when explicitly asked to.
- **Never commit directly to `master` (the default branch).** When a commit is approved, create a new branch first (`feat/...`, `fix/...`, `chore/...` as appropriate) and commit there. `master` only advances through merged pull requests, so if you are on `master` when asked to commit, branch first, then commit.
- **Do not push or open PRs.** The maintainer pushes their own branches and opens pull requests; do not run `git push` (or create/merge PRs) unless explicitly asked to.

### SEO & structured data

This is a major focus of the codebase. `layout.tsx` defines the full Next.js `Metadata` (OpenGraph, Twitter, robots, icons, manifest). Pages add their own metadata through `buildPageMetadata` (`src/utils/pageMetadata.ts`), which exists because Next does not deep-merge a page's `openGraph` with the layout's; articles use `generateMetadata`. `src/utils/jsonLd.ts` builds a `schema.org` `ProfilePage`/`Person` JSON-LD object (typed with `schema-dts`), rendered via `JsonLdScript` (in `src/components/seo/`); `siteJsonLd.ts` (WebSite, navigation), `breadcrumbJsonLd.ts`, `articleJsonLd.ts` (BlogPosting), and `resumeJsonLd.ts` render through `JsonLd` and link to the person by `@id` `#person`. **JSON-LD, Google Tag Manager (`DeferredGoogleTagManager`), `PageviewTracker`, and `ServiceWorkerManager` are all gated on `process.env.NODE_ENV === 'production'`** (see `layout.tsx`), so they do not appear in dev; use `pnpm build` + `pnpm preview` to check them.

### Styling (Tailwind v4)

CSS-first configuration lives in `src/app/globals.css`; there is **no `tailwind.config.js`**. Theme tokens, custom keyframes (`shine`), and custom utilities (`text-box-trim-*`, `text-box-edge-*`) are declared with `@theme` / `@utility` directives. Dark mode is driven by a `data-theme="light|dark"` attribute on `<html>`: a first-time visitor gets their OS colour scheme, and picking Light or Dark stores that choice in `localStorage` as `theme` so it wins from then on; `ThemeScript` applies it before first paint, and the `dark` custom variant in `globals.css` matches `[data-theme='dark']` with a `prefers-color-scheme` fallback when no attribute is set (see `src/components/layout/ThemeToggle/theme.ts`). Use the `cn()` helper (`@/utils/cn`, wraps `clsx` + `tailwind-merge`) for conditional class composition. Respect `motion-safe:` prefixes on animations.

- **Tailwind utilities are the default** for component styling, composed via `cn()`.
- **Custom CSS that a section or component needs (and that is not a global concern) goes in a co-located CSS Module** (`ComponentName.module.css` beside the component's `index.tsx`), imported only by that component via the `@/` alias and applied with `cn(styles.x, '...utilities...')`. Do **not** add component- or section-specific rules to `globals.css`. Handle that component's theming inside its module with the paired selectors `:global(html[data-theme='dark']) .x` plus the `@media (prefers-color-scheme: dark) :global(html:not([data-theme])) .x` no-JS fallback (and scope properties like `color-scheme` there too, not on `:root`, unless they are genuinely site-wide). See `SignatureSpotlight`, `AnimatedUnderline`, and `SkillsArea/SkillCard` for the pattern.
- **`globals.css` is reserved for global concerns only**: theme tokens, base styles, shared keyframes, and shared `@theme` / `@utility` declarations used across the app.
- **Inside a CSS Module, prefer Tailwind over hand-written CSS.** Any declaration expressible as a utility must be written with `@apply` (e.g. `@apply pointer-events-none absolute inset-0 opacity-0 motion-safe:transition-opacity`). This includes properties that have **no named utility but do have an arbitrary-property equivalent**: write `@apply [-webkit-user-drag:none] [-webkit-touch-callout:none]` (and `motion-safe:animate-[my-keyframes_5s_ease-in-out_infinite]` to drive an animation), not the raw declarations. Reach for raw CSS only for what Tailwind genuinely cannot express: a `color-mix()` / `radial-gradient()` / `conic-gradient()` value, a `@keyframes` body, a bespoke custom property. Using `@apply` in a module requires `@reference "tailwindcss";` at the top of the file so the utilities resolve. Prefer Tailwind variants over hand-rolled media queries too (`motion-safe:` instead of a `prefers-reduced-motion` block); a raw `@media (prefers-color-scheme: dark)` is acceptable only for theming a custom property, matching `SignatureSpotlight`.

#### Signature accent bloom (cards and section surfaces)

This is the site's signature interaction, and it is a **design-system rule, not a one-off**: every self-contained card or section-level surface (skill tiles, project cards, the contact panel, and any new equivalent) should carry the same ambient accent glow that rests quiet and blooms gently on hover. When you build a new card or section, add it; do not ship a flat, glow-less surface.

The pattern (see `SkillsArea/SkillCard`, `Footer/SignatureSpotlight`, and `pages/home/ContactArea/ContactForm.module.css` as the reference implementations):

- **Mechanism**: a co-located CSS Module `.x::before` pseudo-element, `@apply pointer-events-none absolute inset-0` (behind content, e.g. `z-0`/`z-[-1]` with the surface `relative isolate`), holding a `radial-gradient(...)` whose colour is a `color-mix(in oklab, <accent> var(--<name>-glow), transparent)`. `radial-gradient` + `color-mix` are the sanctioned raw-CSS exceptions; everything else in the module stays `@apply`.
- **Rest vs hover**: the glow **rests dim and blooms to full on hover**, never the reverse and never absent at rest. Drive it with opacity: `@apply opacity-55 motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-out` on `::before`, and `.x:hover::before { @apply opacity-100 }`. Keep it **calm**: a slow fade and a small delta, so it reads as warmth rather than an attention-grab (tiles may bloom from `opacity-0`, but larger panels should retain a faint rest glow). Always `motion-safe:`.
- **Theme-aware strength**: expose the intensity as a custom property and step it **up in dark mode** via the paired selectors, mirroring the token rules: `:global(html[data-theme='dark']) .x { --<name>-glow: 16% }` plus the `@media (prefers-color-scheme: dark) :global(html:not([data-theme])) .x { ... }` no-JS fallback. Light rests lower (around `9%`).
- **Accent colour**: use the surface's contextual accent, not a hardcoded one. A per-item brand colour flows in through an inline custom property with a fallback (`var(--brand-color, var(--foreground))`, as `SkillCard` does); a themed section may commit to a single accent (the contact panel uses `var(--color-emerald-500)`, tied to its green success state). Prefer the `foreground` token or the section's own accent so the bloom stays on-theme.

Path alias: `@/*` -> `./src/*`.

### Developer wiki

`docs/wiki/` is the developer wiki: one flat folder, one `.md` file per page, with `Home.md` as the front page and `_Sidebar.md` as the menu. It explains how every feature works and how the files connect, in simple language with mermaid diagrams. **When a change alters how a feature works, update its wiki page in the same change.**

- Follow the page template and rules in `docs/wiki/Wiki-Guide.md`: sections in the order "In short", "Files involved", "How it works", "How to change it", "Good to know", "Related pages"; under 150 lines per page (split instead of growing); at most two diagrams per page; plain, easy words.
- Keep the folder flat (GitHub wikis ignore subfolders). Link pages as `[Text](Page-Name.md)`; the publish workflow strips `.md` for the wiki.
- A new page gets a link in `_Sidebar.md` and, if it is a main topic, in `Home.md`.
- Wiki diagrams must parse too: check them with mermaid before handing them over.

### Deployment

`.github/workflows/deploy.yml` runs on push to `master`: pnpm install -> `pnpm build` -> upload `./out` -> deploy to GitHub Pages. The build receives `PAGES_BASE_PATH`, but note `next.config.ts` does **not** currently consume it into `basePath`, and the site works because it serves from a custom domain at root. If the deploy target ever changes to a subpath, wire `basePath`/`assetPrefix` into `next.config.ts`.

`.github/workflows/publish-wiki.yml` runs on push to `master` when `docs/wiki/**` changes (or manually): it syncs `docs/wiki/` into the `<repo>.wiki.git` repository with `rsync --delete`, rewrites `Page.md` links to `Page`, and pushes. `docs/wiki/` is the source of truth, so edits made on the GitHub wiki website are overwritten. The wiki repository only exists after its first page is saved once from the Wiki tab.
