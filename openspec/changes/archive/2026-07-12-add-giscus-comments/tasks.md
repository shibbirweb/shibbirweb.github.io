## 1. giscus repo setup (manual, maintainer)

- [ ] 1.1 Enable GitHub Discussions on `shibbirweb/shibbirweb.github.io` (Settings -> Features -> Discussions).
- [ ] 1.2 Install the giscus GitHub App on the repo (https://github.com/apps/giscus).
- [ ] 1.3 At https://giscus.app, select the repo, `pathname` mapping, and a discussion category, then copy the generated `data-repo-id` and `data-category-id`.

## 2. Config in src/config/constants.ts

- [x] 2.1 Add `export const giscusRepo = 'shibbirweb/shibbirweb.github.io'` next to `googleTagManagerId` / `facebookPageId`.
- [x] 2.2 Add `giscusRepoId`, `giscusCategory`, and `giscusCategoryId` consts, filling `giscusRepoId`/`giscusCategoryId` with the values from task 1.3 and `giscusCategory` with the chosen category name. (Filled with the maintainer's real IDs; category is `Comments`.)
- [x] 2.3 Add a short comment above the giscus consts noting they are generated at https://giscus.app after enabling Discussions and installing the giscus app.

## 3. Comments client island

- [x] 3.1 Create `src/components/pages/articles/Comments/index.tsx` as a `'use client'` component: read the giscus consts from `@/config/constants`, render a single container `<div ref>`, and call `useGiscus` with the config. Keep it thin (hook + JSX).
- [x] 3.2 Create `src/components/pages/articles/Comments/hooks/useGiscus.ts` (`'use client'`). In a `useEffect`, build a `<script src="https://giscus.app/client.js">` element with `data-repo`, `data-repo-id`, `data-category`, `data-category-id`, `data-mapping="pathname"`, `data-loading="lazy"`, `data-reactions-enabled="1"`, `data-emit-metadata="0"`, `data-input-position="bottom"`, `data-lang="en"`, `crossorigin="anonymous"`, `async`, and `data-theme` from `getResolvedTheme()` (`dark` -> `'dark'`, else `'light'`), then append it to the container ref.
- [x] 3.3 In the same hook, `subscribe()` (from `@/components/layout/ThemeToggle/theme`) to theme changes and, on each change, `postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app')` to `container.querySelector('iframe.giscus-frame')?.contentWindow` so the widget re-themes live.
- [x] 3.4 On effect cleanup, clear the container's contents and unsubscribe so a re-mount does not double-inject the script/iframe (mirror the cleanup shape in `MermaidRenderer/hooks/useMermaidSvg.ts`).
- [x] 3.5 Apply container spacing/separator with Tailwind utilities via `cn()`; only add a colocated `Comments.module.css` (with `@reference "tailwindcss";` and `@apply`) if a declaration cannot be expressed as a utility.

## 4. Wire into the article page

- [x] 4.1 Import `Comments` (via the `@/` alias) in `src/components/pages/articles/ArticleView/index.tsx` alongside the other article components.
- [x] 4.2 Render `<Comments />` in the article content column (`min-w-0` div), directly after `<ArticlePager ... />` and before the closing of that column, so it sits below the body and above the related-articles aside.

## 5. Verify

- [x] 5.1 `pnpm build` succeeds and the static export in `./out` still generates (no server feature introduced).
- [x] 5.2 Serve `./out`, open an article page, and confirm the giscus thread renders below the article (requires the real IDs from tasks 1-2; otherwise giscus shows a config error).
- [x] 5.3 Toggle the site theme on the article page and confirm the giscus widget flips light/dark live with no reload.
- [x] 5.4 `pnpm lint` passes.
