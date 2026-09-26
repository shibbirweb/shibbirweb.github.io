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

There is currently no automated test framework or coverage threshold. Before submitting changes, run `pnpm lint` and `pnpm build`. Manually verify affected routes with `pnpm dev`, including responsive behavior and article rendering where relevant. Check production-only features with `pnpm build` then `pnpm preview`. Mermaid diagrams fall back silently to plain text when they fail to parse, so look at them rendered. If introducing tests, colocate them as `*.test.ts` or `*.test.tsx` and add the runner command to `package.json`.

## Documentation

`docs/wiki/` explains how each feature works and how the files connect. When a change alters a feature's behavior, update its wiki page in the same change. Follow `docs/wiki/Wiki-Guide.md`: a flat folder, the shared page template, under 150 lines per page, at most two mermaid diagrams, plain language, and `[Text](Page-Name.md)` links. Add new pages to `_Sidebar.md`. `.github/workflows/publish-wiki.yml` publishes `docs/wiki/` to the GitHub wiki on merge to `master`, overwriting edits made on the wiki website.

## Commit & Pull Request Guidelines

History follows Conventional Commit-style subjects such as `feat:`, `fix:`, and `refactor:`. Keep commits focused with an imperative, lowercase summary.

Do not commit without explicit approval, commit directly to `master`, or push/open a PR unless requested. Approved commits belong on `feat/...`, `fix/...`, or `chore/...` branches and must not include AI attribution. PRs should describe the change, verification, and linked issue or plan; include screenshots for visual work.
