# Page backgrounds

> **In short:** Every page sits on a soft two colour wash. Article pages use their cover colours, other pages get colours from a hash of the URL, and the home page paints its own per section swells. The footer name signature is drawn as a faint graph of the maintainer's real GitHub contributions that brightens near the cursor.

## Files involved

| File                                                            | What it does                                   |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `src/components/backgrounds/PageGradientBackground/index.tsx`   | The wash behind every page.                    |
| `PageGradientBackground/PageGradientProvider.tsx`               | Context so a page can override the colours.    |
| `PageGradientBackground/SyncPageGradient.tsx`                   | Sets the override on mount, clears on unmount. |
| `src/utils/pageGradient.ts`                                     | URL to colour pair (hash based).               |
| `src/components/backgrounds/GridBackground.tsx`                 | Grid lines (hero, error pages, offline page).  |
| `src/components/wrappers/WithGridAnimatedBackgroundWrapper.tsx` | Hero wrapper with a pulsing grid.              |
| `src/components/layout/Footer/SignatureSpotlight/`              | The footer signature effect.                   |

## How the page wash picks colours

```mermaid
flowchart TD
    A[PageGradientBackground] --> B{override set?}
    B -- yes --> C[use override<br/>set by ArticleView]
    B -- no --> D{route}
    D -- /articles/slug --> E[coverGradientForSlug]
    D -- / --> F[transparent<br/>home paints its own]
    D -- other --> G[pageGradientColors<br/>hash of the path]
```

1. `PageGradientBackground` is always mounted in the root layout, behind everything (`-z-10`).
2. It writes `--page-grad-from` and `--page-grad-to` inline.
3. Both are registered with `@property`, so a route change cross fades them over 700ms.
4. The wash strength is 6% in light and 12% in dark.

**Hash colours:** `pageGradientColors` hashes the path. The first hue is `hash % 360`, and the second is 120 to 200 degrees away. So each page has its own stable tint.

## Home section swells

Home is transparent here because `globals.css` gives each `main.home-sections > section` its own vertical gradient. The colours cycle through `--section-swell-indigo`, `blue`, `yellow`, and `teal`.

## Footer signature

- Two layers stacked in one grid cell: the solid "Shibbir" SVG, and a canvas that redraws the letters as GitHub style contribution squares.
- The squares always show faintly (`--graph-rest` in `SignatureSpotlight.module.css`). `usePointerSpotlight` tracks the pointer across the window and writes CSS variables to the signature box, with no React re-render. Both layers read them: the squares rise to full strength in a circle near the pointer, and in dark mode the solid letter fades out there by the same amount. Light mode keeps the solid letter behind the squares (`--solid-keep`), because the pale gaps would otherwise break its smooth edge into stair steps. The circle and its brightness ease after the pointer (`easeToward` in `src/utils/`) instead of snapping.
- `useActivityGraph` keeps a square wherever its centre falls inside the letter path (`activityField.ts`) and draws them with `drawActivityGraph.ts`. It redraws when the theme changes.
- The squares show the last 30 days of GitHub contributions (`githubActivityDays`). The days run left to right: the oldest is in the "S", today is in the "D" (`mapDaysToCells` in `githubActivity.ts`), so each letter covers two or three days. Each day gets an equal-width band. Near each border the shade eases into the next day, with a little random feathering (`DAY_EDGE_SOFTNESS`, `DAY_EDGE_JITTER`), so a busy day fades out instead of stopping at a hard line. Squares are also randomly dimmed a little (`DAY_TEXTURE_DEPTH`), so a busy day reads as texture.
- While the spotlight is lit, active squares breathe gently around their real level. Empty days glow faintly, never past 45% of the way to level 1, so they react to the pointer but never look like work that did not happen.
- The five square colours are the `--activity-level-0` to `4` grayscale variables in `SignatureSpotlight.module.css`, with a dark set for dark mode.
- Touch devices and reduced motion get the faint graph, standing still.

## Where the GitHub data comes from

- GitHub's own calendar sends no CORS header and its API needs a token, so the browser calls a public community proxy instead. It only returns a whole year, so the store keeps the newest 30 days. The URL, day count, cache key and 4 hour limit are in `SignatureSpotlight/contents.ts`, built from `githubUsername` in `src/config/constants.ts`.
- `watchGithubActivity` (`githubActivityStore.ts`) shows the `localStorage` copy at once. If it is missing or older than 4 hours, it calls the proxy once the footer is about 600px away, then caches the result. So each browser calls the proxy at most once every 4 hours. In local development (`isDevelopment`) the cache is skipped, so every reload fetches fresh data.
- Until real data arrives, or if the proxy fails, times out (8s) or storage is blocked, the graph shows a seeded decorative pattern. Real data fades in over it.
- Browser tests block third-party requests, so most specs see the decorative pattern. `tests/e2e/footer.spec.ts` mocks the proxy with `page.route` to check the request timing, the cache, trimming to 30 days, and the fallback when the proxy fails.

## Good to know

- To tint a new page from its own data, render `<SyncPageGradient colors={[from, to]} />` in it.
- Grid colours come from `--grid-line` and `--grid-dot` in `globals.css`.

## Related pages

- [Design system](Design-System.md)
- [Home page](Home-Page.md)
- [Root layout](Root-Layout.md)
