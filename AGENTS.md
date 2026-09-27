# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router portfolio. Keep routing in `src/app/` and reusable UI in `src/components/`; components must never import from `src/app/`. Helpers, loaders, configuration, and types belong in `src/utils/`, `src/lib/`, `src/config/`, and `src/types/`. Update personal data, URLs, and SEO values through `src/config/constants.ts`.

Articles live in `content/articles/` and editor drafts in `content/article_drafts/` (created on the first draft save). Static assets are in `public/`, build helpers in `scripts/`, the developer wiki in `docs/wiki/`, and local scratch plans in `docs/plans/` (git ignored). Treat `.next/`, `out/`, optimizer output, and the generated `public/` files (article covers, `public/og/`, `sw.js`, `giscus-*.css`, the resume PDF) as generated.

## Build, Test, and Development Commands

Use pnpm 10 and Node.js 22, matching the deployment workflow.

- `pnpm dev`: generate assets and start Turbopack locally.
- `pnpm dev:https`: run development with experimental HTTPS.
- `pnpm lint`: run ESLint with Next.js, TypeScript, and Prettier rules.
- `pnpm format` / `pnpm format:check`: apply or check Prettier formatting.
- `pnpm build`: create the production static export in `out/`.
- `pnpm preview` / `pnpm preview:https`: serve `out/` like GitHub Pages on ports 4321 / 4322.
- `pnpm preview:docker`: serve `out/` with nginx and a locally trusted certificate.
- `pnpm gen:covers`, `gen:og`, `gen:resume`, `gen:giscus`: rerun a single asset generator.

## Coding Style & Naming Conventions

Write strict TypeScript. Use `@/` for every `src` import, including same-folder imports; never use relative paths. Prettier enforces four-space indentation, semicolons, single quotes, ES5 trailing commas, one JSX attribute per line, and Tailwind class sorting. Run `pnpm exec prettier --write <path>`. Never use em dash characters.

Use PascalCase for components and their folders, `useCamelCase` for hooks, and camelCase for utilities. Move stateful logic into named, colocated hooks. Prefer Tailwind; put component-specific CSS in a colocated module.

## Architecture Constraints

Production uses static export for GitHub Pages. Do not introduce API routes, middleware, ISR, runtime server rendering, or built-in `next/image` optimization. The development-only article editor may use server features because `.dev.tsx` routes are excluded from production builds; gate other dev-only UI on `isDevelopment` from `src/config/env.ts`.

JSON-LD, Google Tag Manager, pageview tracking, and the service worker (with its update toast) render only when `NODE_ENV` is `production`, so they never appear under `pnpm dev`.

## Testing Guidelines

`.github/workflows/ci.yml` runs on every pull request to `master` and must pass: lint, typecheck, Prettier on changed files, Vitest unit and component tests, `pnpm build` plus build checks on `out/`, Playwright browser tests (desktop, laptop, tablet, mobile), and Lighthouse score floors. Run the same locally with `pnpm test:ci`, or piece by piece: `pnpm test`, then `pnpm build`, `pnpm test:build`, `pnpm test:e2e`, `pnpm test:lighthouse`.

Colocate unit and component tests beside the code (`*.test.ts` runs in Node, `*.test.tsx` in jsdom). Content-wide checks live in `tests/content/`, export checks in `tests/build/`, and browser specs in `tests/e2e/` (import `test` from `@tests/e2e/fixtures`, which blocks third-party requests and fails on page errors). Add or update tests with every behavior change, and add new routes to `tests/e2e/routes.ts`. Performance budgets are in `tests/build/performance.test.ts`; raise one only on purpose and say why. See `docs/wiki/Testing.md` for details.

Still verify affected routes by hand with `pnpm dev`, and production-only features with `pnpm build` then `pnpm preview`.

## Documentation

`docs/wiki/` explains how each feature works and how the files connect. When a change alters a feature's behavior, update its wiki page in the same change. Follow `docs/wiki/Wiki-Guide.md`: a flat folder, the shared page template, under 150 lines per page, at most two mermaid diagrams, plain language, and `[Text](Page-Name.md)` links. Add new pages to `_Sidebar.md`. `.github/workflows/publish-wiki.yml` publishes `docs/wiki/` to the GitHub wiki on merge to `master`, overwriting edits made on the wiki website.

## Commit & Pull Request Guidelines

History follows Conventional Commit-style subjects such as `feat:`, `fix:`, and `refactor:`. Keep commits focused with an imperative, lowercase summary.

Do not commit without explicit approval, commit directly to `master`, or push/open a PR unless requested. Approved commits belong on `feat/...`, `fix/...`, or `chore/...` branches and must not include AI attribution. PRs should describe the change, verification, and linked issue or plan; include screenshots for visual work.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
