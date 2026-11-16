# Testing

> **In short:** Several kinds of tests guard the site: unit and component tests (Vitest), a client import guard, build checks on `./out`, browser tests (Playwright) on the export and on the dev server, and Lighthouse scores. They all run on every pull request to `master` through `.github/workflows/ci.yml`.

## Files involved

| File                       | What it does                                                  |
| -------------------------- | ------------------------------------------------------------- |
| `vitest.config.mts`        | Three Vitest projects: `unit`, `component`, `build`.          |
| `src/**/*.test.ts(x)`      | Unit and component tests, next to the code they test.         |
| `tests/content/`           | Checks on real content: articles, diagrams, data files, copy. |
| `tests/architecture/`      | Code rules, like no Node-only module in browser code.         |
| `tests/build/`             | Checks on the finished export in `./out`.                     |
| `tests/e2e/`               | Playwright browser tests.                                     |
| `tests/e2e-dev/`           | Playwright tests against `pnpm dev`, including the studio.    |
| `tests/setup/`             | Shared setup for each Vitest project.                         |
| `playwright.config.ts`     | Browser test config and the four screen sizes.                |
| `playwright.dev.config.ts` | Browser test config for the dev server.                       |
| `lighthouserc.cjs`         | Lighthouse pages and minimum scores.                          |
| `.github/workflows/ci.yml` | Runs everything on each pull request.                         |

## What runs on a pull request

```mermaid
flowchart LR
    PR[Pull request to master] --> Q[quality<br/>lint, types, format]
    PR --> U[unit<br/>unit + component]
    PR --> B[build<br/>pnpm build + build checks]
    B --> E[e2e<br/>Playwright]
    B --> L[lighthouse<br/>scores]
    PR --> D[e2e-dev<br/>Playwright on pnpm dev]
```

`e2e` and `lighthouse` download the exact `./out` that `build` made, so all three test the same site.

## The test types

| Type       | Command                | What it checks                                                             |
| ---------- | ---------------------- | -------------------------------------------------------------------------- |
| Unit       | `pnpm test:unit`       | Pure logic: markdown, posts, feeds, search, JSON-LD, flow parser.          |
| Content    | `pnpm test:unit`       | Every article's frontmatter, every diagram parses, no em dash, wiki links. |
| Imports    | `pnpm test:unit`       | No `'use client'` file reaches `node:fs` or another Node-only module.      |
| Component  | `pnpm test:component`  | React components and hooks in jsdom (forms, menus, search, theme).         |
| Build      | `pnpm test:build`      | Routes, SEO tags, JSON-LD, sitemap, feeds, PWA files, links, size budgets. |
| Browser    | `pnpm test:e2e`        | Real clicks in Chromium: features, responsive layout, a11y, offline.       |
| Dev server | `pnpm test:e2e:dev`    | Every page and the article editor compile and run under `next dev`.        |
| Lighthouse | `pnpm test:lighthouse` | Performance, accessibility, best practices, SEO scores.                    |

## Screen sizes (Playwright projects)

| Project   | Size          | Runs                                |
| --------- | ------------- | ----------------------------------- |
| `desktop` | 1440 x 900    | Every spec.                         |
| `laptop`  | 1024 x 768    | Responsive and navigation.          |
| `tablet`  | Galaxy Tab S4 | Responsive and accessibility.       |
| `mobile`  | Pixel 7       | Everything that changes on a phone. |

## Run it locally

```bash
pnpm test              # unit + component (fast, no build needed)
pnpm build             # needed before the next three
pnpm test:build
pnpm test:e2e:install  # once: downloads Chromium
pnpm test:e2e
pnpm test:lighthouse   # needs Google Chrome installed
pnpm test:e2e:dev      # no build needed; reuses a running pnpm dev
pnpm test:ci           # everything, in CI order
```

Useful extras: `pnpm test:watch`, `pnpm test:coverage`, and `pnpm test:e2e --ui` to watch browser tests run.

## Writing a new test

- **Cover every layer.** A new feature or an update needs tests in each layer it touches: unit or component, content, build checks, browser, and Lighthouse. Skip a layer only when there is nothing for it to check, and say which one and why. Run them all before calling the change done (`pnpm test:ci`).
- **Put unit and component tests beside the code**: `Foo.tsx` gets `Foo.test.tsx`. `.test.ts` runs in Node, `.test.tsx` runs in jsdom.
- **Use `@/` imports** (and `@tests/` for test helpers), like all other code.
- **Browser specs import `test` from `@tests/e2e/fixtures`**. It blocks all third-party requests and fails on any page error. Mock a service with `page.route`.
- **Wait with `waitForHydration(page)`** before checking diagrams or copy buttons, not `networkidle`. Diagrams only draw near the screen, so it scrolls each one into view, then back to the top.
- **Test what a visitor sees**: roles, labels, and text, not class names.
- **A new page?** Add it to `STATIC_PAGES` in `tests/e2e/routes.ts`. The layout, a11y and dev-server sweeps all read it.
- **A new dev-only route** (`*.dev.tsx`)? Add a spec in `tests/e2e-dev/`. No other suite can reach it.

## Good to know

- **Why two browser suites?** `pnpm build` uses webpack and drops `*.dev.tsx` routes, but `pnpm dev` uses Turbopack. A page can work in one and break in the other, so `tests/e2e-dev/` opens every page on the dev server and fails on an error status, the Next error dialog, or a page error.
- **Browser code must not reach Node-only modules.** Vitest runs in Node, where `node:fs` works, so only the import guard (`tests/architecture/clientImports.test.ts`) catches it. Keep that code on the server, or plug it in from server code.

- **Budgets live in `tests/build/performance.test.ts`.** If a change truly needs more JavaScript, raise the number in the same PR and say why.
- **Formatting is checked only on files the PR changes.** Many older files are not Prettier formatted yet; fix a file when you edit it.
- **Service workers are blocked** in browser tests except `pwa.spec.ts`, because they would hide requests from `page.route`.
- **Vitest counts as development.** It runs with `NODE_ENV=test`, so `isDevelopment` from `@/config/env` is true. A unit test of production-only behaviour must mock `@/config/env` (see `githubActivityStore.test.tsx`), or cover it in a browser spec, which runs against the production build.
- **Failed CI runs upload reports**: `playwright-report`, `coverage`, and `lighthouse-reports` artifacts on the run page.

## Related pages

- [Getting started](Getting-Started.md)
- [Build and deploy](Build-and-Deploy.md)
- [Tooling](Tooling.md)
